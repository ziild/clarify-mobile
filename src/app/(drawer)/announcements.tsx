import { ScrollView } from "react-native";

import { AnnouncementCard } from "@/components/announcements/AnnouncementCard";
import { AnnouncementCardSkeleton } from "@/components/announcements/AnnouncementCardSkeleton";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import { useAnnouncements } from "@/hooks/useAnnouncements";
import { useAuthSession } from "@/hooks/useAuthSession";
import { USE_MOCKS } from "@/lib/config";
import { MOCK_DATA_NOTICE } from "@/mocks";

export default function AnnouncementsScreen() {
  const { user } = useAuthSession();
  // If the role is somehow missing, fall back to the least-privileged role.
  const role = user?.role ?? "student";
  const feed = useAnnouncements({ sort: "latest" }, role);
  const canAcknowledge = role === "student";

  const canRetry =
    feed.error !== null &&
    (feed.error.kind === "network" || feed.error.kind === "server");

  return (
    <ScrollView
      className="flex-1 bg-ustp-cream"
      contentContainerStyle={{ padding: 16, gap: 16 }}
    >
      {USE_MOCKS ? <Badge label={MOCK_DATA_NOTICE} variant="urgent" /> : null}

      {feed.actionError ? (
        <ErrorBanner
          title="Could not acknowledge"
          message={feed.actionError.message}
        />
      ) : null}

      {feed.status === "loading" ? (
        <>
          <AnnouncementCardSkeleton />
          <AnnouncementCardSkeleton />
          <AnnouncementCardSkeleton />
        </>
      ) : null}

      {feed.status === "error" && feed.error ? (
        <ErrorBanner
          title={
            feed.error.kind === "forbidden"
              ? "Access Denied"
              : "Could not load announcements"
          }
          message={feed.error.message}
          onRetry={canRetry ? feed.reload : undefined}
        />
      ) : null}

      {feed.status === "ready" && feed.items.length === 0 ? (
        <EmptyState
          title="No announcements yet"
          message="New notices from your Course Hubs will appear here."
        />
      ) : null}

      {feed.status === "ready"
        ? feed.items.map((announcement) => (
            <AnnouncementCard
              key={announcement.id}
              announcement={announcement}
              canAcknowledge={canAcknowledge}
              isAcknowledging={feed.acknowledgingId === announcement.id}
              onAcknowledge={(id) => void feed.acknowledge(id)}
            />
          ))
        : null}
    </ScrollView>
  );
}
