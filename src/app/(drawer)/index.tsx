import { useRouter } from "expo-router";
import { ScrollView, Text, View } from "react-native";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { MOCK_CHANNELS, MOCK_DATA_NOTICE } from "@/mocks";

export default function DashboardScreen() {
  const router = useRouter();

  return (
    <ScrollView
      className="flex-1 bg-ustp-cream"
      contentContainerStyle={{ padding: 24, gap: 20 }}
    >
      <View className="gap-1 rounded-2xl bg-ustp-navy p-5">
        <Text className="text-2xl font-bold text-ustp-gold">Welcome back!</Text>
        <Text className="text-base text-white">
          Latest announcements and messages will appear here (Phase 4b).
        </Text>
      </View>

      <Badge label={MOCK_DATA_NOTICE} variant="urgent" />

      <View className="gap-3">
        <Text className="text-lg font-semibold text-ustp-navy">
          Your Course Hubs
        </Text>
        {MOCK_CHANNELS.map((channel) => (
          <Button
            key={channel.id}
            title={channel.name}
            variant="outline"
            onPress={() =>
              router.push({
                pathname: "/channels/[channelId]",
                params: { channelId: String(channel.id) },
              })
            }
          />
        ))}
      </View>

      <View className="gap-3">
        <Text className="text-sm text-ustp-text">
          Temporary shortcut for testing:
        </Text>
        <Button
          title="Open login screen (placeholder)"
          variant="secondary"
          onPress={() => router.push("/login")}
        />
      </View>
    </ScrollView>
  );
}
