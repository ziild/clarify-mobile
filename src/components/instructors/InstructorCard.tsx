import { Image, Text, View } from "react-native";

import { Badge } from "@/components/ui/Badge";
import type { Instructor } from "@/types/api";

/** "Dr. Ramon Villanueva" becomes "RV". Words ending in a period (titles) are skipped. */
function getInitials(name: string): string {
  const words = name
    .split(/\s+/)
    .filter((word) => word.length > 0 && !word.endsWith("."));
  const initials = words
    .slice(0, 2)
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase();
  return initials.length > 0 ? initials : "?";
}

export function InstructorCard({ instructor }: { instructor: Instructor }) {
  return (
    <View className="flex-row items-center gap-4 rounded-2xl border border-gray-200 bg-white p-4">
      {instructor.avatar_url ? (
        <Image
          source={{ uri: instructor.avatar_url }}
          accessibilityLabel={`${instructor.name} profile picture`}
          className="h-14 w-14 rounded-full bg-gray-200"
        />
      ) : (
        <View
          accessibilityLabel={`${instructor.name} initials`}
          className="h-14 w-14 items-center justify-center rounded-full bg-ustp-navy"
        >
          <Text className="text-lg font-bold text-ustp-gold">
            {getInitials(instructor.name)}
          </Text>
        </View>
      )}

      <View className="flex-1 gap-1">
        <Text className="text-lg font-bold text-ustp-navy">
          {instructor.name}
        </Text>
        {instructor.campus ? (
          <Text className="text-sm text-ustp-text">{instructor.campus}</Text>
        ) : null}
        <Badge label={instructor.department} variant="department" />
      </View>
    </View>
  );
}
