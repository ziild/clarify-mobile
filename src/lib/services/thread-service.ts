import { ApiError, apiRequest } from "@/lib/api-client";
import { USE_MOCKS } from "@/lib/config";
import { mockDelay } from "@/lib/mock-delay";
import { MOCK_THREADS } from "@/mocks";
import type {
    ApiItemResponse,
    ApiListResponse,
    AuthUser,
    CreateThreadInput,
    Thread,
    ThreadQuery,
    UpdateThreadInput,
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

// ───────────────────────── Student actions (Phase 4d, step 2) ─────────────────────────

const FORBIDDEN_CREATE_MESSAGE =
  "Access Denied: Only students can submit inquiries.";
const FORBIDDEN_CHANGE_MESSAGE =
  "Access Denied: You can only change your own un-resolved inquiry.";

/** POST /channels/{id}/threads. The real response shape is ASSUMED: { message?, data: Thread }. */
export async function createThread(
  channelId: number,
  input: CreateThreadInput,
  author: AuthUser,
): Promise<ApiItemResponse<Thread>> {
  if (USE_MOCKS) {
    await mockDelay(600);

    if (author.role !== "student") {
      throw new ApiError("forbidden", FORBIDDEN_CREATE_MESSAGE, 403);
    }

    const fieldErrors: Record<string, string[]> = {};
    if (input.subject_hashtag.trim().length <= 1) {
      fieldErrors.subject_hashtag = ["The subject hashtag field is required."];
    }
    if (input.content.trim().length === 0) {
      fieldErrors.content = ["The content field is required."];
    }
    if (Object.keys(fieldErrors).length > 0) {
      throw new ApiError(
        "validation",
        "Please check the highlighted fields.",
        422,
        fieldErrors,
      );
    }

    const created: Thread = {
      id: Math.max(0, ...mockThreadStore.map((thread) => thread.id)) + 1,
      channel_id: channelId,
      announcement_id: input.announcement_id,
      subject_hashtag: input.subject_hashtag.trim(),
      content: input.content.trim(),
      is_private: input.is_private,
      status: "open",
      is_pinned_faq: false,
      author_name: author.name,
      is_own: true,
      created_at: new Date().toISOString(),
      reply: null,
    };
    mockThreadStore.unshift(created);

    return { message: "Inquiry submitted.", data: { ...created } };
  }

  return apiRequest<ApiItemResponse<Thread>>(`/channels/${channelId}/threads`, {
    method: "POST",
    body: input,
  });
}

/** PATCH /threads/{id}. A student edits only the text of their own un-resolved inquiry. */
export async function updateThread(
  id: number,
  input: UpdateThreadInput,
  author: AuthUser,
): Promise<ApiItemResponse<Thread>> {
  if (USE_MOCKS) {
    await mockDelay(500);

    const thread = mockThreadStore.find((item) => item.id === id);
    if (!thread) {
      throw new ApiError("server", "Inquiry not found.", 404);
    }
    if (
      author.role !== "student" ||
      !thread.is_own ||
      thread.status === "resolved"
    ) {
      throw new ApiError("forbidden", FORBIDDEN_CHANGE_MESSAGE, 403);
    }
    if (input.content.trim().length === 0) {
      throw new ApiError(
        "validation",
        "Please check the highlighted fields.",
        422,
        {
          content: ["The content field is required."],
        },
      );
    }

    thread.content = input.content.trim();
    return { message: "Inquiry updated.", data: { ...thread } };
  }

  return apiRequest<ApiItemResponse<Thread>>(`/threads/${id}`, {
    method: "PATCH",
    body: input,
  });
}

/** DELETE /threads/{id}. */
export async function deleteThread(
  id: number,
  author: AuthUser,
): Promise<void> {
  if (USE_MOCKS) {
    await mockDelay(500);

    const thread = mockThreadStore.find((item) => item.id === id);
    if (!thread) {
      throw new ApiError("server", "Inquiry not found.", 404);
    }
    if (
      author.role !== "student" ||
      !thread.is_own ||
      thread.status === "resolved"
    ) {
      throw new ApiError("forbidden", FORBIDDEN_CHANGE_MESSAGE, 403);
    }
    mockThreadStore.splice(mockThreadStore.indexOf(thread), 1);
    return;
  }

  await apiRequest<unknown>(`/threads/${id}`, { method: "DELETE" });
}
