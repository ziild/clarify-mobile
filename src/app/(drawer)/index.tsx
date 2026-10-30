import { useRouter } from "expo-router";
import { useState } from "react";
import { ScrollView, Text, View } from "react-native";

import { PushStatusCard } from "@/components/notifications/PushStatusCard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useAuthSession } from "@/hooks/useAuthSession";
import { MOCK_CHANNELS, MOCK_DATA_NOTICE } from "@/mocks";

export default function DashboardScreen() {
  const router = useRouter();
  const { user, signOut } = useAuthSession();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const firstName = user?.name.split(" ")[0] ?? "";
  const isFaculty = user?.role === "faculty";

  async function handleSignOut() {
    setIsSigningOut(true);
    await signOut();
  }

  return (
    <ScrollView
      className="flex-1 bg-ustp-cream"
      contentContainerStyle={{ padding: 24, gap: 20 }}
    >
      <View className="gap-2 rounded-2xl bg-ustp-navy p-5">
        <Text className="text-2xl font-bold text-ustp-gold">
          Welcome back, {firstName}!
        </Text>
        <View className="flex-row">
          <Badge
            label={isFaculty ? "FACULTY" : "STUDENT"}
            variant={isFaculty ? "tag" : "department"}
          />
        </View>
        <Text className="text-base text-white">
          {isFaculty
            ? "You can publish notices in your Course Hubs and answer inquiries."
            : "You can read notices, acknowledge them, and send inquiries."}
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

      <PushStatusCard />

      <Button
        title="Log out"
        loadingTitle="Logging out..."
        variant="secondary"
        loading={isSigningOut}
        onPress={() => void handleSignOut()}
      />
    </ScrollView>
  );
}
