import React, { useState } from "react";

export default function App() {
  const [owner, setOwner] = useState("facebook");
  const [repo, setRepo] = useState("react");
  const [activeSpeech, setActiveSpeech] = useState("");
  const [rpcPayload, setRpcPayload] = useState<string>("Ready to test MCP stream...");
  const [loading, setLoading] = useState(false);

  const callMcp = async (toolName: string) => {
    setLoading(true);
    setActiveSpeech("Querying DevFlow MCP Server...");

    const requestBody = {
      jsonrpc: "2.0",
      id: Date.now(),
      method: "tools/call",
      params: {
        name: toolName,
        arguments: { owner, repo },
      },
    };

    try {
      const res = await fetch("http://localhost:3000/mcp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      const data = await res.json();
      setRpcPayload(JSON.stringify(data, null, 2));

      if (data.result?.content?.[0]?.text) {
        const parsed = JSON.parse(data.result.content[0].text);
        if (toolName === "triage_pipeline_failure") {
          setActiveSpeech(
            `${parsed.diagnosis.rootCause}. Recommended fix: ${parsed.diagnosis.recommendedAction}`
          );
        } else {
          setActiveSpeech(`Retrieved ${parsed.length} open pull requests.`);
        }
      }
    } catch (err: unknown) {
      setRpcPayload(JSON.stringify({ error: (err as Error).message }, null, 2));
      setActiveSpeech("Error communicating with MCP server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 960, margin: "1.5rem auto", padding: "0 1rem", fontFamily: "Segoe UI, sans-serif" }}>
      <header style={{ borderBottom: "1px solid #30363d", paddingBottom: "1rem", marginBottom: "1.2rem" }}>
        <h2 style={{ margin: 0, color: "#58a6ff" }}>DevFlow Assistant</h2>
        <p style={{ margin: "4px 0 0", color: "#8b949e", fontSize: "0.9rem" }}>
          Simulated Alexa+ Agent Skill powered by self-hosted MCP & Local Vector RAG
        </p>
      </header>

      {/* Control panel */}
      <section style={{ display: "flex", gap: "10px", marginBottom: "1rem" }}>
        <input
          value={owner}
          onChange={(e) => setOwner(e.target.value)}
          placeholder="Owner (e.g. facebook)"
          style={{ flex: 1, padding: "10px 14px", background: "#161b22", border: "1px solid #30363d", color: "#fff", borderRadius: 6, fontSize: "0.95rem" }}
        />
        <input
          value={repo}
          onChange={(e) => setRepo(e.target.value)}
          placeholder="Repo (e.g. react)"
          style={{ flex: 1, padding: "10px 14px", background: "#161b22", border: "1px solid #30363d", color: "#fff", borderRadius: 6, fontSize: "0.95rem" }}
        />
        <button
          onClick={() => callMcp("triage_pipeline_failure")}
          disabled={loading}
          style={{ padding: "10px 18px", background: "#238636", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontWeight: 600, fontSize: "0.95rem" }}
        >
          {loading ? "Diagnosing..." : "Triage CI Failure"}
        </button>
        <button
          onClick={() => callMcp("list_pull_requests")}
          disabled={loading}
          style={{ padding: "10px 18px", background: "#1f6feb", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontWeight: 600, fontSize: "0.95rem" }}
        >
          List PRs
        </button>
      </section>

      {/* Voice synthesis display */}
      <div style={{ background: "#161b22", border: "1px solid #388bfd33", borderRadius: 8, padding: "1rem 1.25rem", marginBottom: "1.2rem" }}>
        <div style={{ fontSize: "0.75rem", color: "#58a6ff", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>
          Alexa+ Voice Synthesis
        </div>
        <div style={{ fontSize: "1.05rem", color: "#e6edf3", lineHeight: 1.5 }}>
          {activeSpeech || "Ready for voice interaction simulation."}
        </div>
      </div>

      {/* JSON-RPC inspector */}
      <div>
        <div style={{ fontSize: "0.75rem", color: "#8b949e", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>
          MCP Streamable JSON-RPC Trace
        </div>
        <pre style={{ background: "#05070a", border: "1px solid #30363d", borderRadius: 8, padding: "1rem", color: "#7ee787", overflowX: "auto", fontSize: "0.85rem", height: "320px", margin: 0 }}>
          {rpcPayload}
        </pre>
      </div>
    </div>
  );
}