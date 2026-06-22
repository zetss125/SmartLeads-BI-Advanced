import { NormalizedLead } from "@/types";

let inMemoryLeads: NormalizedLead[] = [];

export function getLeads(): NormalizedLead[] {
  return [...inMemoryLeads];
}

export function setLeads(leads: NormalizedLead[]): void {
  inMemoryLeads = leads;
}

export function addLeads(leads: NormalizedLead[]): void {
  inMemoryLeads = [...leads, ...inMemoryLeads];
}

export function deleteLead(id: string): boolean {
  const initialLength = inMemoryLeads.length;
  inMemoryLeads = inMemoryLeads.filter(l => l.id !== id);
  return inMemoryLeads.length !== initialLength;
}

export function updateLeadContacted(id: string, contacted: boolean): NormalizedLead | null {
  const lead = inMemoryLeads.find(l => l.id === id);
  if (!lead) return null;
  lead.contacted = contacted;
  return { ...lead };
}

export function updateLeadsContacted(ids: string[], contacted: boolean): void {
  inMemoryLeads.forEach(l => {
    if (l.id && ids.includes(l.id)) {
      l.contacted = contacted;
    }
  });
}

export function generateId(): string {
  return "lead_" + Math.random().toString(36).substring(2, 11) + "_" + Date.now().toString(36);
}
