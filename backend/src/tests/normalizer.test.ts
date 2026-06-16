import { autoMapColumns, normalizeRows, parseFile } from "../utils/normalizer";

describe("Schema Auto-Mapping", () => {
  it("should successfully auto-map correct columns when names match synonyms", () => {
    const headers = ["Client Name", "Email Address", "Activity Logs", "Urgency Rank", "Created Time"];
    const mapping = autoMapColumns(headers);
    expect(mapping).not.toBeNull();
    expect(mapping?.name).toBe("Client Name");
    expect(mapping?.email).toBe("Email Address");
    expect(mapping?.signals).toBe("Activity Logs");
  });

  it("should return null for mapping when critical columns are missing", () => {
    const headers = ["Some Random Column", "Another Unfamiliar Header"];
    const mapping = autoMapColumns(headers);
    expect(mapping).toBeNull();
  });
});

describe("File Normalization", () => {
  it("should parse and normalize raw row objects into standard leads", () => {
    const rawRows = [
      {
        "Customer Name": "Alice Smith",
        "Contact Email": "alice@site.com",
        "Source Channel": "Instagram",
        "Action History": "added to cart, viewed details",
        "Urgency Level": "High",
        "Timestamp": "2026-06-12"
      }
    ];

    const mapping = {
      name: "Customer Name",
      email: "Contact Email",
      phone: "",
      platform: "Source Channel",
      signals: "Action History",
      urgency: "Urgency Level",
      date: "Timestamp"
    };

    const normalized = normalizeRows(rawRows, mapping);
    expect(normalized.length).toBe(1);
    expect(normalized[0].name).toBe("Alice Smith");
    expect(normalized[0].email).toBe("alice@site.com");
    expect(normalized[0].platform).toBe("Instagram");
    expect(normalized[0].signals).toContain("added to cart");
    expect(normalized[0].urgency).toBe("high");
    expect(normalized[0].behavioralSentence).toBe("added to cart; viewed details; HIGH urgency");
  });
});

describe("File Format Parsing", () => {
  it("should parse JSON buffers successfully", async () => {
    const rawJson = JSON.stringify([{ name: "John", email: "john@example.com" }]);
    const buffer = Buffer.from(rawJson, "utf8");
    const parsed = await parseFile(buffer, "leads.json");
    expect(parsed.length).toBe(1);
    expect(parsed[0].name).toBe("John");
  });

  it("should parse CSV buffers successfully", async () => {
    const rawCsv = "name,email,signals\nJohn,john@example.com,added to cart";
    const buffer = Buffer.from(rawCsv, "utf8");
    const parsed = await parseFile(buffer, "leads.csv");
    expect(parsed.length).toBe(1);
    expect(parsed[0].name).toBe("John");
    expect(parsed[0].email).toBe("john@example.com");
  });
});
