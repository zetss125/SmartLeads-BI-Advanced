import { SmartLeadsEvent, SmartLeadsEventType } from "@/types";
import { generateId } from "@/lib/encryption";

type SSEClient = {
  id: string;
  controller: ReadableStreamDefaultController;
};

let clients: SSEClient[] = [];
let recentEvents: SmartLeadsEvent[] = [];

export function addSSEClient(controller: ReadableStreamDefaultController): string {
  const id = generateId("sse");
  clients.push({ id, controller });

  // Send recent events to new client (replay last 10)
  const replay = recentEvents.slice(0, 10);
  for (const event of replay) {
    try {
      const data = `data: ${JSON.stringify(event)}\n\n`;
      controller.enqueue(new TextEncoder().encode(data));
    } catch {
      // Client might have disconnected
    }
  }

  return id;
}

export function removeSSEClient(id: string): void {
  clients = clients.filter((c) => c.id !== id);
}

export function broadcastEvent(
  type: SmartLeadsEventType,
  payload: Record<string, unknown>,
  urgency: "critical" | "high" | "normal" = "normal"
): SmartLeadsEvent {
  const event: SmartLeadsEvent = {
    id: generateId("evt"),
    type,
    payload,
    timestamp: new Date().toISOString(),
    urgency,
  };

  recentEvents = [event, ...recentEvents].slice(0, 50);

  // Broadcast to all connected clients
  const deadClients: string[] = [];
  for (const client of clients) {
    try {
      const data = `data: ${JSON.stringify(event)}\n\n`;
      client.controller.enqueue(new TextEncoder().encode(data));
    } catch {
      deadClients.push(client.id);
    }
  }

  // Clean up dead connections
  if (deadClients.length > 0) {
    clients = clients.filter((c) => !deadClients.includes(c.id));
  }

  return event;
}

export function getRecentEvents(): SmartLeadsEvent[] {
  return [...recentEvents];
}

export function getConnectedClientCount(): number {
  return clients.length;
}

// ─── Convenience Emitters ─────────────────────────────────────────

export function emitLeadCreated(leadName: string, platform: string, leadId: string): void {
  broadcastEvent("lead.created", { leadName, platform, leadId }, "normal");
}

export function emitLeadScored(leadName: string, score: number, priority: string, leadId: string): void {
  broadcastEvent("lead.scored", { leadName, score, priority, leadId }, "normal");
}

export function emitUrgentAlert(
  leadName: string,
  trigger: string,
  recommendedAction: string,
  leadId: string,
  minutesAgo?: number
): void {
  broadcastEvent(
    "lead.urgent_alert",
    { leadName, trigger, recommendedAction, leadId, minutesAgo: minutesAgo || 0 },
    "critical"
  );
}

export function emitSocialConversion(user: string, platform: string, leadId: string): void {
  broadcastEvent("social.comment_converted", { user, platform, leadId }, "high");
}

export function emitApprovalChanged(name: string, status: string, approvalId: string): void {
  broadcastEvent("approval.status_changed", { name, status, approvalId }, "normal");
}
