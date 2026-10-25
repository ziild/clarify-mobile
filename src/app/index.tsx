import { useState } from "react";
import { ScrollView, Text, View } from "react-native";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import { Input } from "@/components/ui/Input";
import { Skeleton } from "@/components/ui/Skeleton";

export default function ComponentGallery() {
  const [title, setTitle] = useState("");
  const [showTitleError, setShowTitleError] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const handleSave = () => {
    if (title.trim().length === 0) {
      setShowTitleError(true);
      return;
    }
    setShowTitleError(false);
    setIsSaving(true);
    setTimeout(() => setIsSaving(false), 1500); // fake network delay for the demo
  };

  return (
    <ScrollView
      className="flex-1 bg-ustp-cream"
      contentContainerStyle={{ padding: 24, paddingTop: 64, gap: 24 }}
      keyboardShouldPersistTaps="handled"
    >
      <Text className="text-2xl font-bold text-ustp-navy">
        UI component gallery
      </Text>

      <View className="gap-2">
        <Text className="text-lg font-semibold text-ustp-text">Badges</Text>
        <View className="flex-row flex-wrap gap-2">
          <Badge label="URGENT NOTICE" variant="urgent" />
          <Badge label="OFFICIAL MEMO" variant="tag" />
          <Badge label="CITC" variant="department" />
          <Badge label="RESOLVED" variant="success" />
          <Badge label="Draft" />
        </View>
      </View>

      <View className="gap-3">
        <Text className="text-lg font-semibold text-ustp-text">Buttons</Text>
        <Button title="Primary" onPress={() => {}} />
        <Button title="Secondary" variant="secondary" onPress={() => {}} />
        <Button title="Outline" variant="outline" onPress={() => {}} />
        <Button title="Delete" variant="danger" onPress={() => {}} />
        <Button title="Disabled" disabled onPress={() => {}} />
      </View>

      <View className="gap-3">
        <Text className="text-lg font-semibold text-ustp-text">
          Input with validation and loading button
        </Text>
        <Input
          label="Title"
          placeholder="Type a title, or leave empty and tap Publish"
          value={title}
          onChangeText={setTitle}
          error={showTitleError ? "The title field is required." : undefined}
        />
        <Button
          title="Publish"
          loadingTitle="Publishing..."
          loading={isSaving}
          onPress={handleSave}
        />
      </View>

      <View className="gap-3">
        <Text className="text-lg font-semibold text-ustp-text">
          Skeleton (loading)
        </Text>
        <Skeleton className="h-5 w-3/4 rounded" />
        <Skeleton className="h-4 w-full rounded" />
        <Skeleton className="h-4 w-1/2 rounded" />
      </View>

      <View className="gap-3">
        <Text className="text-lg font-semibold text-ustp-text">
          Empty state
        </Text>
        <EmptyState
          title="No announcements match your filter tags"
          message="Try removing a filter to see more notices."
        />
      </View>

      <View className="gap-3">
        <Text className="text-lg font-semibold text-ustp-text">
          Error banner
        </Text>
        <ErrorBanner
          message={`Could not load announcements. Retries so far: ${retryCount}`}
          onRetry={() => setRetryCount((count) => count + 1)}
        />
        <ErrorBanner
          title="Access Denied"
          message="Only authorized faculty assigned to this Course Hub can publish announcements."
        />
      </View>
    </ScrollView>
  );
}
