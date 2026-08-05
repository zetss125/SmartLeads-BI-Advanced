import { addSSEClient, removeSSEClient } from "@/lib/eventBus";

export const dynamic = "force-dynamic";

export async function GET() {
  const stream = new ReadableStream({
    start(controller) {
      const clientId = addSSEClient(controller);

      // Send initial connection confirmation
      const welcome = `data: ${JSON.stringify({
        id: "welcome",
        type: "system.info",
        payload: { message: "Connected to SmartLeads real-time event stream" },
        timestamp: new Date().toISOString(),
        urgency: "normal",
      })}\n\n`;
      controller.enqueue(new TextEncoder().encode(welcome));

      // Heartbeat every 30 seconds to keep connection alive
      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(new TextEncoder().encode(": heartbeat\n\n"));
        } catch {
          clearInterval(heartbeat);
          removeSSEClient(clientId);
        }
      }, 30000);

      // Cleanup when client disconnects (handled by the stream closing)
      // The dead client detection in broadcastEvent handles this
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
