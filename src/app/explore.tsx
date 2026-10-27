import { ScrollView, Text, View } from "react-native";

import { Badge } from "@/components/ui/Badge";
import {
  MOCK_ANNOUNCEMENTS,
  MOCK_CHANNELS,
  MOCK_DATA_NOTICE,
  MOCK_INSTRUCTORS,
  MOCK_STUDENT,
  MOCK_THREADS,
} from "@/mocks";

export default function MockPreview() {
  return (
    <ScrollView
      className="flex-1 bg-ustp-cream"
      contentContainerStyle={{ padding: 24, paddingTop: 64, gap: 20 }}
    >
      <Text className="text-2xl font-bold text-ustp-navy">
        Mock data preview
      </Text>
      <Badge label={MOCK_DATA_NOTICE} variant="urgent" />

      <Text className="text-base text-ustp-text">
        Mock student: {MOCK_STUDENT.name} ({MOCK_STUDENT.role})
      </Text>

      <Text className="text-lg font-semibold text-ustp-navy">
        Course Hubs ({MOCK_CHANNELS.length})
      </Text>
      {MOCK_CHANNELS.map((channel) => (
        <Text key={channel.id} className="text-base text-ustp-text">
          {channel.name}
        </Text>
      ))}

      <Text className="text-lg font-semibold text-ustp-navy">
        Announcements ({MOCK_ANNOUNCEMENTS.length})
      </Text>
      {MOCK_ANNOUNCEMENTS.map((item) => (
        <View key={item.id} className="gap-1 rounded-xl bg-white p-3">
          <Text className="text-base font-semibold text-ustp-text">
            {item.title}
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {item.is_urgent ? <Badge label="URGENT" variant="urgent" /> : null}
            {item.is_edited ? <Badge label="(Edited)" /> : null}
            {item.status === "draft" ? <Badge label="DRAFT" /> : null}
          </View>
          <Text className="text-sm text-ustp-text">
            Read {item.read_reach.acknowledged_count}/
            {item.read_reach.enrolled_total}
          </Text>
        </View>
      ))}

      <Text className="text-lg font-semibold text-ustp-navy">
        Q&A threads ({MOCK_THREADS.length})
      </Text>
      {MOCK_THREADS.map((thread) => (
        <View key={thread.id} className="gap-1 rounded-xl bg-white p-3">
          <Text className="text-base font-semibold text-ustp-text">
            {thread.subject_hashtag} by {thread.author_name}
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {thread.status === "resolved" ? (
              <Badge label="RESOLVED" variant="success" />
            ) : null}
            {thread.is_pinned_faq ? (
              <Badge label="Pinned to Class FAQs" variant="tag" />
            ) : null}
            {thread.is_private ? <Badge label="PRIVATE" /> : null}
          </View>
        </View>
      ))}

      <Text className="text-lg font-semibold text-ustp-navy">
        Instructors ({MOCK_INSTRUCTORS.length})
      </Text>
      {MOCK_INSTRUCTORS.map((person) => (
        <View key={person.id} className="flex-row items-center gap-2">
          <Text className="text-base text-ustp-text">{person.name}</Text>
          <Badge label={person.department} variant="department" />
        </View>
      ))}
    </ScrollView>
  );
}
