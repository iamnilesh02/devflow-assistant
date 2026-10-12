import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { JsonRpcRequest, JsonRpcResponse } from "./types/protocol.js";
import { TOOLS, executeTool } from "./mcp/registry.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Root landing page to avoid 'Cannot GET /'
app.get("/", (_req: Request, res: Response) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>DevFlow MCP Server</title>
      <style>
        body { font-family: system-ui, -apple-system, sans-serif; background: #0d1117; color: #c9d1d9; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
        .card { background: #161b22; border: 1px solid #30363d; border-radius: 8px; padding: 2rem; max-width: 500px; width: 100%; box-shadow: 0 4px 12px rgba(0,0,0,0.5); }
        h1 { color: #58a6ff; font-size: 1.5rem; margin-top: 0; }
        p { color: #8b949e; line-height: 1.5; }
        code { background: #21262d; padding: 2px 6px; border-radius: 4px; color: #7ee787; font-family: monospace; }
        ul { padding-left: 1.2rem; color: #c9d1d9; }
        li { margin-bottom: 0.5rem; }
      </style>
    </head>
    <body>
      <div class="card">
        <h1>DevFlow Assistant MCP Server</h1>
        <p>The backend service is online and listening for JSON-RPC 2.0 commands.</p>
        <p><strong>Available Endpoints:</strong></p>
        <ul>
          <li><code>GET /health</code> - Service and protocol health check</li>
          <li><code>POST /mcp</code> - Model Context Protocol streamable tool runtime</li>
        </ul>
        <p>To run the web simulator, start Vite by running <code>npm run sim</code> in your secondary terminal.</p>
      </div>
    </body>
    </html>
  `);
});

// Protocol health check
app.get("/health", (_req: Request, res: Response) => {
  res.json({
    status: "ok",
    service: "DevFlow MCP Server",
    protocolVersion: "2025-11-25",
  });
});

// JSON-RPC 2.0 MCP streamable endpoint
app.post("/mcp", async (req: Request, res: Response) => {
  const payload = req.body as JsonRpcRequest;

  if (payload.jsonrpc !== "2.0") {
    const errorResponse: JsonRpcResponse = {
      jsonrpc: "2.0",
      id: payload.id ?? null,
      error: { code: -32600, message: "Invalid Request: expected jsonrpc 2.0" },
    };
    return res.status(400).json(errorResponse);
  }

  try {
    if (payload.method === "tools/list") {
      const response: JsonRpcResponse = {
        jsonrpc: "2.0",
        id: payload.id,
        result: { tools: TOOLS },
      };
      return res.json(response);
    }

    if (payload.method === "tools/call") {
      const toolName = (payload.params as { name?: string })?.name || "";
      const toolArgs = (payload.params as { arguments?: Record<string, unknown> })?.arguments || {};

      const result = await executeTool(toolName, toolArgs);
      const response: JsonRpcResponse = {
        jsonrpc: "2.0",
        id: payload.id,
        result,
      };
      return res.json(response);
    }

    const notFoundResponse: JsonRpcResponse = {
      jsonrpc: "2.0",
      id: payload.id,
      error: { code: -32601, message: `Method ${payload.method} not implemented` },
    };
    return res.status(404).json(notFoundResponse);
  } catch (err: unknown) {
    const failureResponse: JsonRpcResponse = {
      jsonrpc: "2.0",
      id: payload.id,
      error: { code: -32603, message: (err as Error).message },
    };
    return res.status(500).json(failureResponse);
  }
});

app.listen(port, () => {
  console.log(`[DevFlow] MCP server active at http://localhost:${port}`);
});