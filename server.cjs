const jsonServer = require("json-server");
const http = require("http");
const crypto = require("crypto");
const { WebSocketServer, WebSocket } = require("ws");

const app = jsonServer.create();
const router = jsonServer.router("db.json");
const middlewares = jsonServer.defaults();

const port = process.env.PORT || 3001;

const httpServer = http.createServer(app);

const wss = new WebSocketServer({
  server: httpServer,
  path: "/ws",
});

function broadcast(type, payload) {
  const event = {
    eventId: crypto.randomUUID(),
    type,
    timestamp: new Date().toISOString(),
    payload,
  };

  const message = JSON.stringify(event);

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });

  console.log(`WebSocket event: ${type}`);
}

wss.on("connection", (socket) => {
  console.log("WebSocket client connected");

  socket.on("error", (error) => {
    console.error("WebSocket error:", error.message);
  });

  socket.on("close", () => {
    console.log("WebSocket client disconnected");
  });
});

app.use(middlewares);

app.use((req, res, next) => {
  const pathname = new URL(req.url, "http://localhost").pathname;
  const match = pathname.match(/^\/tickets(?:\/([^/]+))?\/?$/);

  if (!match || !["POST", "PATCH", "PUT", "DELETE"].includes(req.method)) {
    return next();
  }

  const ticketId = match[1] ? decodeURIComponent(match[1]) : null;

  const previousTicket = ticketId
    ? router.db.get("tickets").find({ id: ticketId }).value()
    : null;

  let responseBody;

  const originalJson = res.json.bind(res);

  res.json = (body) => {
    responseBody = body;
    return originalJson(body);
  };

  res.on("finish", () => {
    if (res.statusCode < 200 || res.statusCode >= 300) {
      return;
    }

    if (req.method === "POST") {
      const ticket = responseBody;

      if (ticket && ticket.id) {
        broadcast("TICKET_CREATED", { ticket });
      }

      return;
    }

    if (req.method === "DELETE") {
      if (previousTicket) {
        broadcast("TICKET_DELETED", { ticketId });
      }

      return;
    }

    const updatedTicket = router.db
      .get("tickets")
      .find({ id: ticketId })
      .value();

    if (!updatedTicket) {
      return;
    }

    let eventSent = false;

    if (previousTicket?.status !== updatedTicket.status) {
      broadcast("TICKET_STATUS_CHANGED", { ticket: updatedTicket });
      eventSent = true;
    }

    if (previousTicket?.assignedTo !== updatedTicket.assignedTo) {
      broadcast("TICKET_ASSIGNED", { ticket: updatedTicket });
      eventSent = true;
    }

    if (!eventSent) {
      broadcast("TICKET_UPDATED", { ticket: updatedTicket });
    }
  });

  next();
});

app.use(router);

httpServer.listen(port, "0.0.0.0", () => {
  console.log(`JSON Server is running on port ${port}`);
  console.log(`WebSocket server is running on ws://localhost:${port}/ws`);
});