import { useRouter } from "expo-router";
import { ScrollView, Text, View } from "react-native";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function LoginScreen() {
  const router = useRouter();

  return (
    <ScrollView className="flex-1 bg-ustp-cream">
      <View className="bg-ustp-navy px-6 pb-10 pt-20">
        <Text className="text-4xl font-bold text-ustp-gold">ClariFy</Text>
        <Text className="mt-1 text-base text-white">
          USTP-CDO campus noticeboard
        </Text>
      </View>

      <View className="gap-4 p-6">
        <Text className="text-sm text-ustp-text">
          Placeholder: login is built in Phase 4a.
        </Text>
        <Input label="Institutional ID" placeholder="e.g. 2020202020" />
        <Input label="Password" placeholder="Password" secureTextEntry />
        <Button title="Log in" disabled onPress={() => {}} />
        <Button
          title="Back to dashboard"
          variant="outline"
          onPress={() => router.replace("/")}
        />
      </View>
    </ScrollView>
  );
}
