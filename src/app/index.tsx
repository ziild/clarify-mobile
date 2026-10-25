import { Text, View } from "react-native";

export default function HomeScreen() {
  return (
    <View style={{ flex: 1, padding: 24, paddingTop: 80, gap: 16 }}>
      {/* Box 1: plain React Native styles, no NativeWind */}
      <View style={{ backgroundColor: "#1a1851", padding: 16 }}>
        <Text style={{ color: "#fcb315", fontSize: 20 }}>
          1. Inline style works
        </Text>
      </View>

      {/* Box 2: a built-in Tailwind color, no custom tokens */}
      <View className="bg-red-500 p-4">
        <Text className="text-xl text-white">2. className with red-500</Text>
      </View>

      {/* Box 3: our custom USTP color token */}
      <View className="bg-ustp-gold p-4">
        <Text className="text-xl text-ustp-text">
          3. className with ustp-gold
        </Text>
      </View>
    </View>
  );
}
