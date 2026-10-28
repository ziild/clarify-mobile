import { ApiError, apiRequest } from "@/lib/api-client";
import { USE_MOCKS } from "@/lib/config";
import { mockDelay } from "@/lib/mock-delay";
import { MOCK_ANNOUNCEMENTS } from "@/mocks";
import type {
    Announcement,
    AnnouncementQuery,
    ApiItemResponse,
    ApiListResponse,
    UserRole,
} from "@/types/api";

const PER_PAGE = 10;

// A copy, so acknowledging in mock mode does not change the original mock file.
// Mock acknowledgments are kept in memory only and reset when the app fully restarts.
const mockStore: Announcement[] = MOCK_ANNOUNCEMENTS.map((item) => ({
  ...item,
  read_reach: { ...item.read_reach },
}));

/** Pinned first, then newest first. */
function byPinnedThenNewest(a: Announcement, b: Announcement): number {
  if (a.is_pinned !== b.is_pinned) {
    return a.is_pinned ? -1 : 1;
  }
  return (
    new Date(b.published_at).getTime() - new Date(a.published_at).getTime()
  );
}

/**
 * GET /announcements (playbook §6.5).
 * `viewerRole` is only used by mock mode to imitate the server. In real mode the
 * server decides what each user may see from their token.
 */
export async function fetchAnnouncements(
  query: AnnouncementQuery,
  viewerRole: UserRole,
): Promise<ApiListResponse<Announcement>> {
  if (USE_MOCKS) {
    await mockDelay(600);

    // To test the error banner, temporarily remove the two slashes on the next line:
    // throw new ApiError('network', 'Cannot reach the server. Check your connection and try again.');

    const search = query.search?.trim().toLowerCase() ?? "";
    const matches = mockStore.filter((item) => {
      if (viewerRole === "student" && item.status !== "published") return false; // no drafts for students
      if (
        query.channel_id !== undefined &&
        item.channel_id !== query.channel_id
      )
        return false;
      if (query.tag && !item.tags.includes(query.tag)) return false;
      if (
        query.department &&
        !item.tags.includes(query.department) &&
        item.publisher.department !== query.department
      ) {
        return false;
      }
      if (
        search &&
        !`${item.title} ${item.content}`.toLowerCase().includes(search)
      )
        return false;
      return true;
    });

    const sorted = [...matches].sort(byPinnedThenNewest);
    const page = query.page ?? 1;
    const start = (page - 1) * PER_PAGE;

    return {
      data: sorted.slice(start, start + PER_PAGE),
      meta: {
        current_page: page,
        last_page: Math.max(1, Math.ceil(sorted.length / PER_PAGE)),
        per_page: PER_PAGE,
        total: sorted.length,
      },
    };
  }

  // The spread copies the query into a plain object that apiRequest accepts.
  return apiRequest<ApiListResponse<Announcement>>("/announcements", {
    query: { ...query },
  });
}

/**
 * POST /announcements/{id}/acknowledge (playbook §6.5).
 * The playbook does not show the response, so ASSUMED: { data: Announcement }.
 */
export async function acknowledgeAnnouncement(
  id: number,
): Promise<Announcement> {
  if (USE_MOCKS) {
    await mockDelay(400);

    const item = mockStore.find((announcement) => announcement.id === id);
    if (!item) {
      throw new ApiError("server", "Announcement not found.", 404);
    }
    if (!item.read_reach.has_current_user_acknowledged) {
      const count = item.read_reach.acknowledged_count + 1;
      item.read_reach = {
        ...item.read_reach,
        acknowledged_count: count,
        percentage:
          Math.round((count / item.read_reach.enrolled_total) * 1000) / 10,
        has_current_user_acknowledged: true,
      };
    }
    return { ...item };
  }

  const response = await apiRequest<ApiItemResponse<Announcement>>(
    `/announcements/${id}/acknowledge`,
    { method: "POST" },
  );
  return response.data;
}
