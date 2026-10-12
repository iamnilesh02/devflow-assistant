@'
# DevFlow Assistant

DevFlow Assistant is an autonomous DevOps intelligence agent designed for the Amazon Alexa+ ecosystem. It provides a self-hosted Model Context Protocol (MCP) server running over Streamable HTTP (spec 2025-11-25) to triage broken CI/CD pipelines, inspect GitHub Actions failures, and query repository pull requests through natural agent interactions.

---

## Tracks & Challenges Entered

* **Primary Track:** Alexa+ (Self-hosted Streamable HTTP MCP Server & Simulated Alexa+ Web Agent)
* **Mini Challenge:** Open Source (MIT Licensed public repository)

---

## What It Does & How It Works

Software developers frequently lose focus when continuous integration pipelines break, having to leave their code editors to manually navigate noisy web interfaces and sift through thousands of lines of raw build logs. DevFlow Assistant bridges repository health and incident diagnosis directly into conversational AI environments:

1. **Protocol Standard:** Implements a self-hosted Model Context Protocol (MCP) server over Streamable HTTP exposing RFC-compliant JSON-RPC 2.0 endpoints (`tools/list` and `tools/call`).
2. **Telemetry Ingestion:** Queries the GitHub Actions Octokit API to pull repository health, discover the latest failing workflow run, and isolate the exact failing step.
3. **Local Vector RAG Engine:** Instead of sending noisy, uncurated stack traces to expensive cloud endpoints or requiring external vector databases, an in-process semantic similarity engine tokenizes error signatures and computes cosine similarity against operational runbooks.
4. **Actionable Remediation:** Synthesizes a direct, voice-friendly root cause analysis and terminal fix command, streaming the structured result back to the Alexa+ agent client.
5. **Interactive Web Simulator:** Features a simulated Alexa+ browser dashboard providing interactive tool execution and live JSON-RPC trace inspection.

---

## System Architecture

```text
+--------------------------------------------------------------------------+
|                         Frontend Client Layer                            |
|             Simulated Alexa+ Dashboard (React + Vite)                    |
+------------------------------------+-------------------------------------+
                                     | JSON-RPC 2.0 (Streamable HTTP / MCP)
                                     v
+------------------------------------+-------------------------------------+
|                  DevFlow MCP Server (Express Engine)                     |
|  - Specification: Streamable HTTP (Spec 2025-11-25)                      |
|  - Methods: tools/list, tools/call                                       |
+---------+------------------------------------------------------+---------+
          |                                                      |
          v                                                      v
+------------------------------------+     +-------------------------------+
|     Octokit GitHub REST Client     |     |    Local Vector RAG Engine    |
| - List Open Pull Requests          |     | - In-Memory Runbook Database  |
| - Inspect Failed Workflow Runs     |     | - TF-IDF Tokenizer & Vectors  |
| - Target Broken Jobs & Steps       |     | - Cosine Similarity Matcher   |
+------------------------------------+     +-------------------------------+

## Repository Structure

devflow-assistant/
├── LICENSE                    # Open Source MIT License
├── README.md                  # System overview, friction logs, and documentation
├── package.json               # Dependencies and build scripts
├── package-lock.json          # Dependency lockfile
├── tsconfig.json              # TypeScript compiler configuration
├── .gitignore                 # Exclusion rules for node_modules and .env
├── src/                       # Backend MCP Server
│   ├── index.ts               # HTTP & JSON-RPC 2.0 server entry point
│   ├── constants/
│   │   └── runbooks.ts        # Built-in operational knowledge base
│   ├── mcp/
│   │   └── registry.ts        # MCP tool definitions and execution router
│   ├── services/
│   │   ├── github.ts          # Octokit GitHub REST API integrations
│   │   └── vectorRag.ts       # Vector tokenization and cosine similarity engine
│   └── types/
│       └── protocol.ts        # JSON-RPC and MCP schema definitions
└── sim/                       # Frontend Alexa+ Simulation Client
    ├── index.html             # HTML entry point
    └── src/
        ├── main.tsx           # React DOM mounting
        └── App.tsx            # Simulated agent controls & live protocol inspector


## Quickstart & Local Setup
# Prerequisites
1) Node.js v20+ or v24+

2) npm v10+

## 1. Clone & Install

git clone [https://github.com/iamnilesh02/devflow-assistant.git](https://github.com/iamnilesh02/devflow-assistant.git)
cd devflow-assistant
npm install

## 2. Configure Environment (Optional)

The system operates cleanly against public repositories out-of-the-box without authentication. To query private enterprise repositories or increase rate limits, create a .env file:

PORT=3000
GITHUB_TOKEN=your_github_personal_access_token_here

## 3. Start the MCP Server

Launch the backend server with live file watching on port 3000:

npm run dev


## 4. Start the Alexa+ Simulator

Verify protocol compliance using raw HTTP JSON-RPC 2.0 calls:

Tool Discovery (tools/list)

curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'

Tool Execution (tools/call)

curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"list_pull_requests","arguments":{"owner":"facebook","repo":"react"}}}'

Product Feedback on Tools & SDKs Used
1. Alexa+ Streamable HTTP MCP Specification (2025-11-25)

a) What we used it for: Creating self-hosted agent tool endpoints (tools/list and tools/call) enabling discovery and execution.

b) What worked well: The JSON-RPC 2.0 schema design provides strong protocol safety and clean predictability across transports. Decoupling tool definitions from execution logic makes it straightforward to scale available capabilities.

c) What needs work: Clarification around chunked stream headers versus standard response flushes when operating behind default HTTP proxies.

d) Onboarding experience: Rapid and straightforward to implement using Express and TypeScript.

e) Would we build with it again? Yes. MCP provides a far more maintainable, open standard for agent integration than custom, vendor-specific function schemas.

2. GitHub Actions Octokit REST API

a) What we used it for: Fetching active pull requests and programmatically isolating failed CI/CD workflow steps.

b) What worked well: Direct status filtering (status=failure) allowed rapid isolation of failed jobs without pulling large archive blobs.

c) What needs work: Unauthenticated rate limiting on public calls requires careful caching during rapid local testing loops.

d) Onboarding experience: Familiar and well-documented.

e) Would we build with it again? Yes.


## Friction Log

## Streamable HTTP Transport Reverse Proxy Buffering

a) Task Attempted: Implementing self-hosted MCP endpoints utilizing Streamable HTTP transport for tool discovery and execution.

b) Steps Taken: Implemented Express route handlers accepting JSON-RPC 2.0 frames over POST /mcp.

c) Expected vs. Actual: Expected intermediate proxies and client connections to stream incremental response chunks immediately; standard proxy defaults buffered chunks until socket completion.

d) Severity Rating: Medium.

e) Workaround Used: Standardized on deterministic JSON-RPC 2.0 response envelopes with explicit flush headers to ensure complete delivery across all proxy environments.

f) Actionable Suggestion: Release an official lightweight TypeScript helper package with pre-configured Express/Fastify streaming middleware for the Streamable HTTP specification.


## Native Module Compilation Hurdles on Windows

a) Task Attempted: Setting up local vector retrieval libraries with pre-compiled C++ bindings.

b) Steps Taken: Attempted installing native dependencies on Windows NT 10.0 using node-pre-gyp.

c) Expected vs. Actual: Expected seamless package installation; installation failed due to missing Visual C++ build toolchains.

d) Severity Rating: High.

e) Workaround Used: Built a zero-dependency, pure TypeScript vector space and cosine similarity engine that executes in-memory across any operating system without native build toolchains.

f) Actionable Suggestion: Developer toolchains and starter kits should prioritize pure JavaScript or WebAssembly runtimes to prevent environment-specific onboarding blockers.

## License

This project is open-source and available under the terms of the MIT License.