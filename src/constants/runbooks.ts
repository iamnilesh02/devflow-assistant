import { KnowledgeDoc } from "../types/protocol.js";

export const SEED_RUNBOOKS: KnowledgeDoc[] = [
  {
    id: "rb-01",
    title: "Process Memory Exhaustion",
    content: "JavaScript heap out of memory encountered during bundle build. Resolve by appending NODE_OPTIONS=--max-old-space-size=4096 to your CI script.",
  },
  {
    id: "rb-02",
    title: "Socket Port Collision",
    content: "Error EADDRINUSE port binding error. The process failed to release port 3000. Terminate lingering instances using npx kill-port 3000.",
  },
  {
    id: "rb-03",
    title: "GitHub Actions Scope and Credentials",
    content: "HTTP 401 or 403 authorization failure. Ensure workflow contains permissions write block for contents and pull-requests.",
  },
  {
    id: "rb-04",
    title: "Missing Module Definition",
    content: "Cannot find module or TS2307. Clear build caches and execute npm ci --include=dev before invoking compiler commands.",
  },
];