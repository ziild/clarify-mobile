import { apiRequest } from "@/lib/api-client";
import { USE_MOCKS } from "@/lib/config";
import { mockDelay } from "@/lib/mock-delay";
import { MOCK_THREADS } from "@/mocks";
import type {
    ApiListResponse,
    AuthUser,
    Thread,
    ThreadQuery,
} from "@/types/api";

// A copy, so later steps can change threads in mock mode without touching the mock file.
// Mock changes live in memory only and reset when the app fully restarts.
const mockThreadStore: Thread[] = MOCK_THREADS.map((thread) => ({
  ...thread,
  reply: thread.reply ? { ...thread.reply } : null,
}));

/** Students see public threads and their own private ones. Faculty see everything (playbook Table E). */
function canView(thread: Thread, viewer: AuthUser): boolean {
  if (viewer.role === "student") {
    return !thread.is_private || thread.is_own;
  }
  return true;
}

/**
 * GET /channels/{id}/threads (playbook §6.5).
 * The real response shape is ASSUMED to be a paginated list. Only the first page is read for now.
 * The Class FAQs tab uses this same list, filtered on is_pinned_faq (there is no FAQ endpoint).
 */
export async function fetchThreads(
  channelId: number,
  query: ThreadQuery,
  viewer: AuthUser,
): Promise<Thread[]> {
  if (USE_MOCKS) {
    await mockDelay(500);

    // To test the error banner, temporarily remove the two slashes on the next line:
    // throw new ApiError('network', 'Cannot reach the server. Check your connection and try again.');

    return mockThreadStore
      .filter(
        (thread) =>
          thread.channel_id === channelId &&
          (query.status === undefined || thread.status === query.status) &&
          (query.announcement_id === undefined ||
            thread.announcement_id === query.announcement_id) &&
          canView(thread, viewer),
      )
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      )
      .map((thread) => ({ ...thread }));
  }

  const response = await apiRequest<ApiListResponse<Thread>>(
    `/channels/${channelId}/threads`,
    {
      query: { ...query },
    },
  );
  return response.data;
}
