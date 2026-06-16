import express, { Request, Response } from "express";
import cors from "cors";
import multer from "multer";
import * as dotenv from "dotenv";
import { 
  parseFile, 
  autoMapColumns, 
  getLLMAssistedMapping, 
  normalizeRows, 
  NormalizedLead, 
  ColumnMapping 
} from "./utils/normalizer";
import { scoreLead, scoreBatchLeads } from "./services/scoring";
import { processChatQuery } from "./services/chatbot";
import { generateMarketingStrategy } from "./services/marketing";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: "50mb" }));

// Configure multer for file uploads (in-memory)
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// In-memory leads storage for simulated data stream
let inMemoryLeads: NormalizedLead[] = [];

// Helper to generate unique IDs
function generateId(): string {
  return "lead_" + Math.random().toString(36).substring(2, 11) + "_" + Date.now().toString(36);
}

/**
 * GET /api/leads
 * Get all leads with optional filters
 */
app.get("/api/leads", (req: Request, res: Response): void => {
  try {
    let filtered = [...inMemoryLeads];
    const { name, platform, priority, contacted } = req.query;

    if (name) {
      filtered = filtered.filter(l => l.name.toLowerCase().includes(String(name).toLowerCase()));
    }
    if (platform) {
      filtered = filtered.filter(l => l.platform.toLowerCase() === String(platform).toLowerCase());
    }
    if (priority) {
      filtered = filtered.filter(l => l.priority?.toLowerCase() === String(priority).toLowerCase());
    }
    if (contacted !== undefined) {
      const isContacted = String(contacted) === "true";
      filtered = filtered.filter(l => l.contacted === isContacted);
    }

    res.json(filtered);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

/**
 * DELETE /api/leads/:id
 * Delete lead by id
 */
app.delete("/api/leads/:id", (req: Request, res: Response): void => {
  try {
    const { id } = req.params;
    const initialLength = inMemoryLeads.length;
    inMemoryLeads = inMemoryLeads.filter(l => l.id !== id);
    
    if (inMemoryLeads.length === initialLength) {
      res.status(404).json({ error: "Lead not found" });
      return;
    }
    
    res.json({ success: true, message: `Lead ${id} deleted successfully` });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

/**
 * PUT /api/leads/:id/contacted
 * Custom status toggler for lead contact status
 */
app.put("/api/leads/:id/contacted", (req: Request, res: Response): void => {
  try {
    const { id } = req.params;
    const { contacted } = req.body;

    const lead = inMemoryLeads.find(l => l.id === id);
    if (!lead) {
      res.status(404).json({ error: "Lead not found" });
      return;
    }

    lead.contacted = !!contacted;
    res.json(lead);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

/**
 * POST /api/upload
 * Parse customer datasets, score them, and insert in-memory.
 * Supports custom column mapping and LLM mapping confirmation.
 */
app.post("/api/upload", upload.single("file"), async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ error: "No file uploaded" });
      return;
    }

    const { mapping, force } = req.body;
    const rawRows = await parseFile(req.file.buffer, req.file.originalname);
    
    if (rawRows.length === 0) {
      res.status(400).json({ error: "The uploaded file is empty" });
      return;
    }

    const headers = Object.keys(rawRows[0]);
    let activeMapping: ColumnMapping | null = null;

    // Use custom mapping if provided by user
    if (mapping) {
      try {
        activeMapping = typeof mapping === "string" ? JSON.parse(mapping) : mapping;
      } catch (e) {
        res.status(400).json({ error: "Invalid column mapping format" });
        return;
      }
    }

    // Auto-detect mappings if none provided
    if (!activeMapping) {
      const autoMap = autoMapColumns(headers);
      if (autoMap) {
        activeMapping = autoMap;
      } else {
        // Unfamiliar columns: ask LLM mapping
        const suggestedMapping = await getLLMAssistedMapping(headers);
        
        // Return required confirmation payload
        if (String(force) !== "true") {
          res.json({
            mappingRequired: true,
            headers,
            suggestedMapping
          });
          return;
        }
        activeMapping = suggestedMapping;
      }
    }

    // Normalize and score leads
    const normalized = normalizeRows(rawRows, activeMapping!);
    const scored = await scoreBatchLeads(normalized);

    // Assign IDs and save
    const processedLeads = scored.map(lead => ({
      ...lead,
      id: generateId()
    }));

    inMemoryLeads = [...processedLeads, ...inMemoryLeads];
    
    res.json({
      success: true,
      mappingUsed: activeMapping,
      leads: processedLeads
    });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

/**
 * POST /api/score
 * Scores a single lead
 */
app.post("/api/score", async (req: Request, res: Response): Promise<void> => {
  try {
    const rawLead: NormalizedLead = req.body;
    if (!rawLead.name || !rawLead.behavioralSentence) {
      res.status(400).json({ error: "Missing required fields: name, behavioralSentence" });
      return;
    }

    const parsedLead: NormalizedLead = {
      name: rawLead.name,
      email: rawLead.email || "",
      phone: rawLead.phone || "",
      platform: rawLead.platform || "unknown",
      signals: rawLead.signals || [],
      urgency: rawLead.urgency || "medium",
      date: rawLead.date || new Date().toISOString().split("T")[0],
      behavioralSentence: rawLead.behavioralSentence,
      contacted: rawLead.contacted || false
    };

    const scored = await scoreLead(parsedLead);
    scored.id = generateId();
    inMemoryLeads.unshift(scored);

    res.json(scored);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

/**
 * POST /api/score-batch
 * Scores a batch of leads
 */
app.post("/api/score-batch", async (req: Request, res: Response): Promise<void> => {
  try {
    const rawLeads: NormalizedLead[] = req.body;
    if (!Array.isArray(rawLeads)) {
      res.status(400).json({ error: "Body must be an array of leads" });
      return;
    }

    const normalized = rawLeads.map(l => ({
      name: l.name,
      email: l.email || "",
      phone: l.phone || "",
      platform: l.platform || "unknown",
      signals: l.signals || [],
      urgency: l.urgency || "medium",
      date: l.date || new Date().toISOString().split("T")[0],
      behavioralSentence: l.behavioralSentence || `${l.signals?.join("; ")}; ${l.urgency === "high" ? "HIGH urgency" : "Low urgency"}`,
      contacted: l.contacted || false
    }));

    const scored = await scoreBatchLeads(normalized);
    const saved = scored.map(lead => ({
      ...lead,
      id: generateId()
    }));

    inMemoryLeads = [...saved, ...inMemoryLeads];
    res.json(saved);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

/**
 * POST /api/chat
 * Chatbot query over lead dataset
 */
app.post("/api/chat", async (req: Request, res: Response): Promise<void> => {
  try {
    const { query, leads, history } = req.body;
    if (!query) {
      res.status(400).json({ error: "Missing required parameter: query" });
      return;
    }

    // Use passed leads or fallback to server leads
    const activeLeads = Array.isArray(leads) ? leads : inMemoryLeads;
    const result = await processChatQuery(query, activeLeads, history || []);
    
    // If the chat returned UPDATE_STATUS actions, synchronize the server in-memory list
    if (result.actions) {
      for (const action of result.actions) {
        if (action.type === "UPDATE_STATUS" && action.payload?.ids) {
          const idsToUpdate: string[] = action.payload.ids;
          const contactedStatus: boolean = !!action.payload.contacted;
          
          inMemoryLeads.forEach(l => {
            if (l.id && idsToUpdate.includes(l.id)) {
              l.contacted = contactedStatus;
            }
          });
        }
      }
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

/**
 * POST /api/marketing/generate
 * Generate marketing plan from current lead statistics
 */
app.post("/api/marketing/generate", async (req: Request, res: Response): Promise<void> => {
  try {
    const { leads, assignTasks } = req.body;
    const activeLeads = Array.isArray(leads) ? leads : inMemoryLeads;
    const result = await generateMarketingStrategy(activeLeads, assignTasks !== false);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

if (process.env.NODE_ENV !== "test") {
  const PORT_NUM = process.env.PORT || 5000;
  app.listen(PORT_NUM, () => {
    console.log(`Server is running on port ${PORT_NUM}`);
  });
}

export default app;


          


