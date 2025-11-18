import { Octokit } from "octokit";

export interface GithubEvent {
  id: string;
  type: string;
  actor: {
    id: number;
    login: string;
    display_login?: string;
    gravatar_id: string;
    url: string;
    avatar_url: string;
  };
  repo: {
    id: number;
    name: string;
    url: string;
  };
  payload: unknown;
  public: boolean;
  created_at: string;
}

/**
 * Get GitHub activity for a user
 * @param token GitHub access token
 * @param username GitHub username (optional, if not provided will use authenticated user)
 * @param startDate Start date (ISO string)
 * @param endDate End date (ISO string)
 */
export async function getGithubActivity(
  token: string,
  startDate: string,
  endDate: string,
  username?: string
): Promise<GithubEvent[]> {
  const octokit = new Octokit({ auth: token });
  const start = new Date(startDate);
  const end = new Date(endDate);

  try {
    // If username is not provided, get the authenticated user
    let targetUser = username;
    if (!targetUser) {
      const { data: user } = await octokit.rest.users.getAuthenticated();
      targetUser = user.login;
    }

    // Fetch events
    // Note: GitHub API pagination for events is limited, but for daily summaries
    // we usually just need the recent ones. We'll fetch a reasonable amount.
    const { data: events } = await octokit.rest.activity.listEventsForAuthenticatedUser({
      username: targetUser,
      per_page: 100, // Max per page
    });

    // Filter by date range
    return (events as GithubEvent[]).filter((event) => {
      if (!event.created_at) return false;
      const eventDate = new Date(event.created_at);
      return eventDate >= start && eventDate <= end;
    });
  } catch (error) {
    console.error("Error fetching GitHub activity:", error);
    return [];
  }
}
