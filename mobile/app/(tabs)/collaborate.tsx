import { ScrollView, Text, View, TouchableOpacity, FlatList, ActivityIndicator, TextInput } from "react-native";
import { useAuth } from "@/hooks/use-auth";
import { ScreenContainer } from "@/components/screen-container";
import { trpc } from "@/lib/trpc";
import { useState } from "react";

/**
 * Collaboration Tab - Real-time notes and activity log
 * Two owners can leave notes, feedback, and see what the other is doing
 */
export default function CollaborateScreen() {
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<"notes" | "activity">("notes");
  const [noteContent, setNoteContent] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<"product_feedback" | "design" | "marketing" | "sales" | "general">("general");

  // Fetch shared notes and activity
  const { data: sharedNotes = [], isLoading: notesLoading, refetch: refetchNotes } = trpc.notes.listShared.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const { data: activity = [], isLoading: activityLoading, refetch: refetchActivity } = trpc.activity.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  // Create note mutation
  const createNoteMutation = trpc.notes.create.useMutation({
    onSuccess: () => {
      setNoteContent("");
      refetchNotes();
      refetchActivity();
    },
  });

  const handleCreateNote = async () => {
    if (!noteContent.trim()) return;

    await createNoteMutation.mutateAsync({
      content: noteContent,
      category: selectedCategory,
      authorId: user?.id,
      authorName: user?.name,
    });
  };

  const categories = [
    { id: "product_feedback", label: "Feedback" },
    { id: "design", label: "Design" },
    { id: "marketing", label: "Marketing" },
    { id: "sales", label: "Sales" },
    { id: "general", label: "General" },
  ] as const;

  if (!isAuthenticated) {
    return (
      <ScreenContainer className="items-center justify-center">
        <Text className="text-foreground">Please sign in to collaborate</Text>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="p-6">
      <View className="gap-4 flex-1">
        {/* Header */}
        <View className="gap-2">
          <Text className="text-2xl font-bold text-foreground">Collaborate</Text>
          <Text className="text-sm text-muted">Work together in real-time</Text>
        </View>

        {/* Tab Selector */}
        <View className="flex-row gap-2 bg-surface rounded-lg p-1">
          <TouchableOpacity
            className={`flex-1 py-2 rounded-md ${activeTab === "notes" ? "bg-primary" : ""}`}
            onPress={() => setActiveTab("notes")}
          >
            <Text className={`text-sm font-semibold text-center ${activeTab === "notes" ? "text-white" : "text-foreground"}`}>
              Notes
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`flex-1 py-2 rounded-md ${activeTab === "activity" ? "bg-primary" : ""}`}
            onPress={() => setActiveTab("activity")}
          >
            <Text className={`text-sm font-semibold text-center ${activeTab === "activity" ? "text-white" : "text-foreground"}`}>
              Activity
            </Text>
          </TouchableOpacity>
        </View>

        {/* Notes Tab */}
        {activeTab === "notes" && (
          <View className="gap-4 flex-1">
            {/* Create Note Section */}
            <View className="bg-surface rounded-xl p-4 border border-border gap-3">
              <Text className="text-sm font-semibold text-foreground">Leave a Note</Text>

              {/* Category Selector */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="gap-2">
                <View className="flex-row gap-2">
                  {categories.map((cat) => (
                    <TouchableOpacity
                      key={cat.id}
                      className={`px-3 py-1 rounded-full ${
                        selectedCategory === cat.id ? "bg-primary" : "bg-background border border-border"
                      }`}
                      onPress={() => setSelectedCategory(cat.id)}
                    >
                      <Text className={`text-xs font-semibold ${selectedCategory === cat.id ? "text-white" : "text-foreground"}`}>
                        {cat.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>

              {/* Note Input */}
              <TextInput
                className="bg-background border border-border rounded-lg p-3 text-white min-h-[100px]"
                placeholder="Type your note here..."
                placeholderTextColor="#666"
                multiline
                value={noteContent}
                onChangeText={setNoteContent}
                style={{ textAlignVertical: 'top' }}
              />

              <TouchableOpacity
                className="bg-primary rounded-lg py-3 active:opacity-80"
                onPress={handleCreateNote}
                disabled={createNoteMutation.isPending}
              >
                <Text className="text-white font-semibold text-center">
                  {createNoteMutation.isPending ? "Posting..." : "Post Note"}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Notes List */}
            {notesLoading ? (
              <View className="flex-1 items-center justify-center">
                <ActivityIndicator size="large" />
              </View>
            ) : sharedNotes.length === 0 ? (
              <View className="flex-1 items-center justify-center gap-2">
                <Text className="text-sm text-muted">No notes yet</Text>
                <Text className="text-xs text-muted">Start collaborating by posting a note</Text>
              </View>
            ) : (
              <FlatList
                data={sharedNotes}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={{ gap: 12, paddingBottom: 20 }}
                renderItem={({ item }) => (
                  <View className="bg-surface rounded-lg p-4 border border-border">
                    <View className="flex-row items-start justify-between gap-2 mb-2">
                      <View className="flex-1">
                        <Text className="text-sm font-semibold text-foreground">
                          {item.authorId === user?.id ? "You" : (item.authorName || 'Co-owner')}
                        </Text>
                        <Text className="text-xs text-muted">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </Text>
                      </View>
                      <View className="bg-primary/20 border border-primary/30 rounded-full px-2 py-1">
                        <Text className="text-[10px] font-semibold text-primary capitalize">
                          {item.category.replace("_", " ")}
                        </Text>
                      </View>
                    </View>
                    <Text className="text-sm text-foreground leading-relaxed">{item.content}</Text>
                  </View>
                )}
              />
            )}
          </View>
        )}

        {/* Activity Tab */}
        {activeTab === "activity" && (
          <View className="gap-4 flex-1">
            {activityLoading ? (
              <View className="flex-1 items-center justify-center">
                <ActivityIndicator size="large" />
              </View>
            ) : activity.length === 0 ? (
              <View className="flex-1 items-center justify-center gap-2">
                <Text className="text-sm text-muted">No activity yet</Text>
              </View>
            ) : (
              <FlatList
                data={activity}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={{ gap: 12, paddingBottom: 20 }}
                renderItem={({ item }) => (
                  <View className="bg-surface rounded-lg p-4 border border-border">
                    <View className="flex-row items-start justify-between gap-2">
                      <View className="flex-1">
                        <Text className="text-sm font-semibold text-foreground capitalize">
                          {item.action.replace(/_/g, " ")}
                        </Text>
                        {item.description && (
                          <Text className="text-sm text-muted mt-1">{item.description}</Text>
                        )}
                        <Text className="text-xs text-muted mt-2">
                          {new Date(item.createdAt).toLocaleString()}
                        </Text>
                      </View>
                    </View>
                  </View>
                )}
              />
            )}
          </View>
        )}
      </View>
    </ScreenContainer>
  );
}
