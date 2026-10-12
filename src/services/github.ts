import { Octokit } from "@octokit/rest";

export class GitHubService {
  private octokit: Octokit;

  constructor() {
    this.octokit = new Octokit({
      auth: process.env.GITHUB_TOKEN || undefined,
    });
  }

  async getRecentPullRequests(owner: string, repo: string) {
    try {
      const { data } = await this.octokit.rest.pulls.list({
        owner,
        repo,
        state: "open",
        per_page: 5,
      });

      return data.map((pr) => ({
        number: pr.number,
        title: pr.title,
        author: pr.user?.login,
        url: pr.html_url,
        createdAt: pr.created_at,
      }));
    } catch (err: unknown) {
      throw new Error(`GitHub PR lookup failed: ${(err as Error).message}`);
    }
  }

  async getRecentFailedWorkflowLogs(owner: string, repo: string) {
    try {
      const runs = await this.octokit.rest.actions.listWorkflowRunsForRepo({
        owner,
        repo,
        status: "failure",
        per_page: 1,
      });

      if (!runs.data.workflow_runs.length) {
        return {
          status: "clean",
          message: "No recent failing runs found on default branch.",
        };
      }

      const run = runs.data.workflow_runs[0];
      const jobs = await this.octokit.rest.actions.listJobsForWorkflowRun({
        owner,
        repo,
        run_id: run.id,
      });

      const failedJob = jobs.data.jobs.find((j) => j.conclusion === "failure");
      const failedStep = failedJob?.steps?.find((s) => s.conclusion === "failure");

      return {
        status: "failed",
        runId: run.id,
        workflowName: run.name,
        failedJob: failedJob?.name || "Unknown job",
        failedStep: failedStep?.name || "Unknown step",
        htmlUrl: run.html_url,
      };
    } catch (err: unknown) {
      throw new Error(`GitHub Actions lookup failed: ${(err as Error).message}`);
    }
  }
}