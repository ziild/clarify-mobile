import { useLocalSearchParams } from "expo-router";
import { ScrollView, Text, View } from "react-native";

import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { MOCK_CHANNELS, MOCK_DATA_NOTICE } from "@/mocks";

export default function CourseHubScreen() {
  const { channelId } = useLocalSearchParams<{ channelId: string }>();
  const channel = MOCK_CHANNELS.find((item) => String(item.id) === channelId);

  return (
    <ScrollView
      className="flex-1 bg-ustp-cream"
      contentContainerStyle={{ padding: 24, gap: 16 }}
    >
      <Badge label={MOCK_DATA_NOTICE} variant="urgent" />
      {channel ? (
        <View className="gap-2">
          <Text className="text-2xl font-bold text-ustp-navy">
            {channel.name}
          </Text>
          {channel.description ? (
            <Text className="text-base text-ustp-text">
              {channel.description}
            </Text>
          ) : null}
          <EmptyState
            title="Course Hub placeholder"
            message="Notices, Q&A threads and Class FAQs will appear here (Phase 4b to 4d)."
          />
        </View>
      ) : (
        <EmptyState
          title="Course Hub not found"
          message="This channel does not exist in the mock data."
        />
      )}
    </ScrollView>
  );
}
