import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ScrollView, Text, View } from "react-native";

import { AnnouncementCard } from "@/components/announcements/AnnouncementCard";
import { AnnouncementCardSkeleton } from "@/components/announcements/AnnouncementCardSkeleton";
import { Chip } from "@/components/announcements/AnnouncementFilterBar";
import { QaThreadCard } from "@/components/threads/QaThreadCard";
import { ThreadCardSkeleton } from "@/components/threads/ThreadCardSkeleton";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import { useAnnouncements } from "@/hooks/useAnnouncements";
import { useAuthSession } from "@/hooks/useAuthSession";
import type { ThreadsStatus } from "@/hooks/useChannelThreads";
import { useChannelThreads } from "@/hooks/useChannelThreads";
import type { ApiError } from "@/lib/api-client";
import { USE_MOCKS } from "@/lib/config";
import { fetchCourseHubs } from "@/lib/services/channel-service";
import { MOCK_DATA_NOTICE } from "@/mocks";
import type { AuthUser, Thread } from "@/types/api";

type HubTab = "notices" | "qa" | "faqs";

function isRetryable(error: ApiError): boolean {
  return error.kind === "network" || error.kind === "server";
}

interface ThreadPanelProps {
  status: ThreadsStatus;
  error: ApiError | null;
  onRetry: () => void;
  items: Thread[];
  emptyTitle: string;
  emptyMessage: string;
  defaultExpanded: boolean;
}

/** Skeleton, error, empty, and populated states for a list of threads. */
function ThreadPanel({
  status,
  error,
  onRetry,
  items,
  emptyTitle,
  emptyMessage,
  defaultExpanded,
}: ThreadPanelProps) {
  if (status === "loading") {
    return (
      <>
        <ThreadCardSkeleton />
        <ThreadCardSkeleton />
        <ThreadCardSkeleton />
      </>
    );
  }
  if (status === "error" && error) {
    return (
      <ErrorBanner
        title={
          error.kind === "forbidden"
            ? "Access Denied"
            : "Could not load questions"
        }
        message={error.message}
        onRetry={isRetryable(error) ? onRetry : undefined}
      />
    );
  }
  if (items.length === 0) {
    return <EmptyState title={emptyTitle} message={emptyMessage} />;
  }
  return (
    <>
      {items.map((thread) => (
        <QaThreadCard
          key={thread.id}
          thread={thread}
          defaultExpanded={defaultExpanded}
        />
      ))}
    </>
  );
}

function CourseHubContent({
  channelId,
  user,
}: {
  channelId: number;
  user: AuthUser;
}) {
  const [tab, setTab] = useState<HubTab>("notices");
  const [channelName, setChannelName] = useState("Course Hub");

  const notices = useAnnouncements(
    { channel_id: channelId, sort: "latest" },
    user.role,
  );
  const threads = useChannelThreads(channelId, user);
  const faqs = threads.items.filter((thread) => thread.is_pinned_faq);

  // The name is only decoration, so if loading it fails we keep the generic title.
  useEffect(() => {
    let cancelled = false;
    fetchCourseHubs()
      .then((hubs) => {
        const found = hubs.find((hub) => hub.id === channelId);
        if (!cancelled && found) setChannelName(found.name);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [channelId]);

  const canAcknowledge = user.role === "student";

  return (
    <ScrollView
      className="flex-1 bg-ustp-cream"
      contentContainerStyle={{ padding: 16, gap: 16 }}
    >
      {USE_MOCKS ? <Badge label={MOCK_DATA_NOTICE} variant="urgent" /> : null}

      <Text className="text-2xl font-bold text-ustp-navy">{channelName}</Text>

      <View className="flex-row flex-wrap gap-2">
        <Chip
          label="Notices"
          selected={tab === "notices"}
          onPress={() => setTab("notices")}
        />
        <Chip
          label="Q&A"
          selected={tab === "qa"}
          onPress={() => setTab("qa")}
        />
        <Chip
          label="Class FAQs"
          selected={tab === "faqs"}
          onPress={() => setTab("faqs")}
        />
      </View>

      {tab === "notices" ? (
        <>
          {notices.actionError ? (
            <ErrorBanner
              title="Could not acknowledge"
              message={notices.actionError.message}
            />
          ) : null}

          {notices.status === "loading" ? (
            <>
              <AnnouncementCardSkeleton />
              <AnnouncementCardSkeleton />
            </>
          ) : null}

          {notices.status === "error" && notices.error ? (
            <ErrorBanner
              title="Could not load announcements"
              message={notices.error.message}
              onRetry={isRetryable(notices.error) ? notices.reload : undefined}
            />
          ) : null}

          {notices.status === "ready" && notices.items.length === 0 ? (
            <EmptyState
              title={`No announcements yet for ${channelName}`}
              message="New notices from this Course Hub will appear here."
            />
          ) : null}

          {notices.status === "ready"
            ? notices.items.map((announcement) => (
                <AnnouncementCard
                  key={announcement.id}
                  announcement={announcement}
                  canAcknowledge={canAcknowledge}
                  isAcknowledging={notices.acknowledgingId === announcement.id}
                  onAcknowledge={(id) => void notices.acknowledge(id)}
                />
              ))
            : null}
        </>
      ) : null}

      {tab === "qa" ? (
        <ThreadPanel
          status={threads.status}
          error={threads.error}
          onRetry={threads.reload}
          items={threads.items}
          emptyTitle="No questions yet"
          emptyMessage={`Inquiries for ${channelName} will appear here.`}
          defaultExpanded={false}
        />
      ) : null}

      {tab === "faqs" ? (
        <ThreadPanel
          status={threads.status}
          error={threads.error}
          onRetry={threads.reload}
          items={faqs}
          emptyTitle="No Class FAQs yet"
          emptyMessage={`No Class FAQs published for ${channelName} yet.`}
          defaultExpanded
        />
      ) : null}
    </ScrollView>
  );
}

export default function CourseHubScreen() {
  const { channelId: channelIdParam } = useLocalSearchParams<{
    channelId: string;
  }>();
  const { user } = useAuthSession();
  const channelId = Number(channelIdParam);

  // This route is protected, so a user always exists here. The check keeps TypeScript satisfied.
  if (!user) {
    return null;
  }

  if (!Number.isInteger(channelId)) {
    return (
      <ScrollView
        className="flex-1 bg-ustp-cream"
        contentContainerStyle={{ padding: 16 }}
      >
        <EmptyState
          title="Course Hub not found"
          message="This link does not point to a Course Hub."
        />
      </ScrollView>
    );
  }

  return <CourseHubContent channelId={channelId} user={user} />;
}
