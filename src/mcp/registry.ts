import { McpToolSchema } from "../types/protocol.js";
import { GitHubService } from "../services/github.js";
import { VectorRAGEngine } from "../services/vectorRag.js";

const gitHubService = new GitHubService();
const ragEngine = new VectorRAGEngine();

export const TOOLS: McpToolSchema[] = [
  {
    name: "list_pull_requests",
    description: "Retrieves active open pull requests for a given repository.",
    inputSchema: {
      type: "object",
      properties: {
        owner: { type: "string", description: "Repository owner or organization name" },
        repo: { type: "string", description: "Repository name" },
      },
      required: ["owner", "repo"],
    },
  },
  {
    name: "triage_pipeline_failure",
    description: "Queries failed CI/CD workflow runs and semantically matches runbooks for fix recommendations.",
    inputSchema: {
      type: "object",
      properties: {
        owner: { type: "string", description: "Repository owner or organization name" },
        repo: { type: "string", description: "Repository name" },
      },
      required: ["owner", "repo"],
    },
  },
];

export async function executeTool(name: string, args: Record<string, unknown>) {
  const owner = String(args.owner || "").trim();
  const repo = String(args.repo || "").trim();

  if (!owner || !repo) {
    throw new Error("Missing required arguments: owner and repo.");
  }

  if (name === "list_pull_requests") {
    const prs = await gitHubService.getRecentPullRequests(owner, repo);
    return {
      content: [{ type: "text", text: JSON.stringify(prs, null, 2) }],
    };
  }

  if (name === "triage_pipeline_failure") {
    const failureLog = await gitHubService.getRecentFailedWorkflowLogs(owner, repo);
    const summaryText = `${failureLog.workflowName || ""} ${failureLog.failedJob || ""} ${failureLog.failedStep || ""}`;
    const diagnosis = ragEngine.generateDiagnosis(summaryText);

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({ failureLog, diagnosis }, null, 2),
        },
      ],
    };
  }

  throw new Error(`Tool "${name}" is not registered on this server.`);
}