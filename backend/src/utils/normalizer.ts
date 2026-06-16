import * as xlsx from "xlsx";
import csvParser from "csv-parser";
import { Readable } from "stream";
import axios from "axios";

export interface NormalizedLead {
  id?: string;
  name: string;
  email: string;
  phone: string;
  platform: string;
  signals: string[];
  urgency: string; // "high", "medium", "low"
  date: string;
  behavioralSentence: string;
  score?: number;
  priority?: "High" | "Medium" | "Low";
  contacted?: boolean;
}

export interface ColumnMapping {
  name: string;
  email: string;
  phone: string;
  platform: string;
  signals: string;
  urgency: string;
  date: string;
}

const STANDARD_COLUMNS = ["name", "email", "phone", "platform", "signals", "urgency", "date"];

/**
 * Detects file extension / format and parses into raw rows of objects.
 */
export async function parseFile(buffer: Buffer, originalName: string): Promise<any[]> {
  const ext = originalName.split(".").pop()?.toLowerCase();
  
  if (ext === "json") {
    try {
      const parsed = JSON.parse(buffer.toString("utf8"));
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch (e) {
      throw new Error("Invalid JSON file format");
    }
  } else if (ext === "xlsx" || ext === "xls") {
    try {
      const workbook = xlsx.read(buffer, { type: "buffer" });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      return xlsx.utils.sheet_to_json(worksheet);
    } catch (e) {
      throw new Error("Invalid Excel file format");
    }
  } else if (ext === "csv" || originalName.endsWith(".csv")) {
    return new Promise((resolve, reject) => {
      const results: any[] = [];
      const stream = Readable.from(buffer.toString("utf8"));
      
      stream
        .pipe(csvParser())
        .on("data", (data) => results.push(data))
        .on("end", () => resolve(results))
        .on("error", (err) => reject(new Error(`Invalid CSV file: ${err.message}`)));
    });
  } else {
    throw new Error("Unsupported file format. Please upload CSV, JSON, or Excel.");
  }
}

/**
 * Heuristically tries to map raw headers to standard columns.
 * Returns null if it cannot find reasonable candidates for critical columns (e.g., name, email or signals).
 */
export function autoMapColumns(headers: string[]): ColumnMapping | null {
  const lowercaseHeaders = headers.map(h => h.toLowerCase().trim());
  const mapping: Partial<ColumnMapping> = {};

  const findMatch = (synonyms: string[]): string => {
    for (const syn of synonyms) {
      const idx = lowercaseHeaders.findIndex(h => h.includes(syn) || syn.includes(h));
      if (idx !== -1) return headers[idx];
    }
    return "";
  };

  mapping.name = findMatch(["name", "customer", "buyer", "fullname", "first", "client"]);
  mapping.email = findMatch(["email", "mail", "contact", "address"]);
  mapping.phone = findMatch(["phone", "tel", "mobile", "number", "cell"]);
  mapping.platform = findMatch(["platform", "social", "source", "channel", "media", "network"]);
  mapping.signals = findMatch(["signal", "action", "behavior", "activity", "engagement", "event", "history", "comment", "message"]);
  mapping.urgency = findMatch(["urgency", "intent", "priority", "speed", "marker"]);
  mapping.date = findMatch(["date", "time", "created", "timestamp"]);

  // If we can't map name, email, or signals, we need LLM / User confirmation
  if (!mapping.name || !mapping.email || !mapping.signals) {
    return null;
  }

  return mapping as ColumnMapping;
}

/**
 * Asks OpenRouter to find column mapping suggestions.
 */
export async function getLLMAssistedMapping(headers: string[]): Promise<ColumnMapping> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const model = process.env.OPENROUTER_MODEL || "openai/gpt-oss-20b:free";
  
  if (!apiKey) {
    // If no API key, fallback to a basic automap with placeholders
    const mapped = autoMapColumns(headers) || {
      name: headers.find(h => /name/i.test(h)) || headers[0] || "",
      email: headers.find(h => /email|mail/i.test(h)) || headers[1] || "",
      phone: headers.find(h => /phone/i.test(h)) || "",
      platform: headers.find(h => /platform|social/i.test(h)) || "",
      signals: headers.find(h => /signal|action|activity|comment|message/i.test(h)) || headers[2] || "",
      urgency: headers.find(h => /urgency|intent/i.test(h)) || "",
      date: headers.find(h => /date|time/i.test(h)) || ""
    };
    return mapped;
  }

  try {
    const prompt = `You are a data normalization assistant. Map the following list of columns from a retail marketing dataset to our standard fields.
Standard fields:
- name (customer name)
- email (customer email address)
- phone (customer phone number or phone contact)
- platform (social media source, e.g. Facebook, Instagram, TikTok, LinkedIn, Twitter/X)
- signals (behavioral interaction descriptions, e.g., added to cart, restock request, size inquiry, fit question, wishlist save)
- urgency (any column indicating urgency level, buying intent, or urgency markers)
- date (date/timestamp of interaction)

Input Columns:
${headers.map(h => `- "${h}"`).join("\n")}

Respond ONLY with a JSON object mapping standard fields to the exact input columns. If a standard field has no matching input column, map it to an empty string "". Do not include markdown code block formatting or any explanation. Example output:
{"name":"Customer Name","email":"Email Address","phone":"","platform":"Social Channel","signals":"Activity Log","urgency":"","date":"Created At"}`;

    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: model,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.1
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        }
      }
    );

    let content = response.data?.choices?.[0]?.message?.content?.trim() || "";
    // Clean up code blocks if present
    if (content.startsWith("```")) {
      content = content.replace(/^```json\s*/i, "").replace(/```$/, "").trim();
    }

    const mapping = JSON.parse(content);
    
    // Ensure all keys exist in the returned object
    const finalMapping: ColumnMapping = {
      name: mapping.name || "",
      email: mapping.email || "",
      phone: mapping.phone || "",
      platform: mapping.platform || "",
      signals: mapping.signals || "",
      urgency: mapping.urgency || "",
      date: mapping.date || ""
    };
    
    return finalMapping;
  } catch (error) {
    // Return basic fallback
    return autoMapColumns(headers) || {
      name: headers[0] || "",
      email: headers[1] || "",
      phone: "",
      platform: "",
      signals: headers[2] || "",
      urgency: "",
      date: ""
    };
  }
}

/**
 * Normalizes raw rows using a ColumnMapping, compiling behavioral sentences.
 */
export function normalizeRows(rows: any[], mapping: ColumnMapping): NormalizedLead[] {
  return rows.map((row, idx) => {
    const name = String(row[mapping.name] || `Lead #${idx + 1}`).trim();
    const email = String(row[mapping.email] || "").trim();
    const phone = String(row[mapping.phone] || "").trim();
    const platform = String(row[mapping.platform] || "unknown").trim();
    
    // Normalize signals into array
    const rawSignals = row[mapping.signals];
    let signals: string[] = [];
    if (rawSignals) {
      if (Array.isArray(rawSignals)) {
        signals = rawSignals.map(s => String(s).trim());
      } else if (typeof rawSignals === "string") {
        signals = rawSignals.split(/[;|,]/).map(s => s.trim()).filter(s => s.length > 0);
      } else {
        signals = [String(rawSignals).trim()];
      }
    }

    const urgencyVal = String(row[mapping.urgency] || "").trim().toLowerCase();
    let urgency = "medium";
    if (urgencyVal.includes("high") || urgencyVal.includes("urg") || urgencyVal.includes("immediate") || urgencyVal.includes("now")) {
      urgency = "high";
    } else if (urgencyVal.includes("low") || urgencyVal.includes("cold") || urgencyVal.includes("later")) {
      urgency = "low";
    }

    const date = String(row[mapping.date] || new Date().toISOString().split("T")[0]).trim();

    // Standardized behavioral sentences compile signals and urgency markers
    // e.g. "Added to cart; Viewed details; HIGH urgency"
    const formattedSignals = signals.join("; ");
    const urgencyMarker = urgency === "high" ? "HIGH urgency" : urgency === "low" ? "Low urgency" : "Medium urgency";
    const behavioralSentence = `${formattedSignals ? formattedSignals + "; " : ""}${urgencyMarker}`;

    return {
      name,
      email,
      phone,
      platform,
      signals,
      urgency,
      date,
      behavioralSentence,
      contacted: false
    };
  });
}
