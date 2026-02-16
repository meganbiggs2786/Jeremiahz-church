import { ScrollView, Text, View, TouchableOpacity, FlatList, ActivityIndicator, TextInput } from "react-native";
import { useAuth } from "@/hooks/use-auth";
import { ScreenContainer } from "@/components/screen-container";
import { trpc } from "@/lib/trpc";
import { useState } from "react";

/**
 * Collaboration Tab - Real-time notes and activity log
 * Two owners can leave notes, feedback, and see what the other is doing
 * Styled with a Medieval/Celtic theme: Gold, Dark Browns, and Serif fonts.
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
        <Text className="text-foreground text-lg" style={{ fontFamily: 'serif' }}>Please sign in to collaborate</Text>
      </ScreenContainer>
    );
  }

  const renderHeader = () => (
    <View className="gap-6 mb-6">
      {/* Header */}
      <View className="gap-1 items-center">
        <Text className="text-3xl font-bold text-primary tracking-widest" style={{ fontFamily: 'serif' }}>
          TUATH COIR
        </Text>
        <View className="h-[1px] w-full bg-border" />
        <Text className="text-lg font-semibold text-foreground mt-2" style={{ fontFamily: 'serif' }}>
          Tribe Collaboration
        </Text>
        <Text className="text-xs text-muted italic" style={{ fontFamily: 'serif' }}>
          Ancient Roots • Unified Tribe
        </Text>
      </View>

      {/* Tab Selector */}
      <View className="flex-row gap-0 bg-surface rounded-none border border-border p-1">
        <TouchableOpacity
          className={`flex-1 py-3 ${activeTab === "notes" ? "bg-primary" : "bg-transparent"}`}
          onPress={() => setActiveTab("notes")}
        >
          <Text className={`text-sm font-bold text-center ${activeTab === "notes" ? "text-background" : "text-foreground"}`} style={{ fontFamily: 'serif' }}>
            SCROLLS (NOTES)
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          className={`flex-1 py-3 ${activeTab === "activity" ? "bg-primary" : "bg-transparent"}`}
          onPress={() => setActiveTab("activity")}
        >
          <Text className={`text-sm font-bold text-center ${activeTab === "activity" ? "text-background" : "text-foreground"}`} style={{ fontFamily: 'serif' }}>
            LEDGER (ACTIVITY)
          </Text>
        </TouchableOpacity>
      </View>

      {/* Create Note Section - only shown on notes tab */}
      {activeTab === "notes" && (
        <View className="bg-surface rounded-none p-4 border-2 border-border gap-4 shadow-xl">
          <Text className="text-base font-bold text-primary" style={{ fontFamily: 'serif' }}>Leave a Message</Text>

          {/* Category Selector */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row gap-2">
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  className={`px-4 py-2 border ${
                    selectedCategory === cat.id ? "bg-primary border-primary" : "bg-background border-border"
                  }`}
                  onPress={() => setSelectedCategory(cat.id)}
                >
                  <Text className={`text-[10px] font-bold uppercase ${selectedCategory === cat.id ? "text-background" : "text-foreground"}`} style={{ fontFamily: 'serif' }}>
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          {/* Note Input */}
          <TextInput
            className="bg-background border border-border p-4 text-foreground min-h-[120px]"
            placeholder="Etch your thoughts here..."
            placeholderTextColor="#5C4033"
            multiline
            value={noteContent}
            onChangeText={setNoteContent}
            style={{ textAlignVertical: 'top', fontFamily: 'serif' }}
          />

          <TouchableOpacity
            className="bg-primary py-4 active:opacity-80 border border-gold"
            onPress={handleCreateNote}
            disabled={createNoteMutation.isPending}
          >
            <Text className="text-background font-black text-center text-base" style={{ fontFamily: 'serif' }}>
              {createNoteMutation.isPending ? "ETCHING..." : "POST TO TRIBE"}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <ScreenContainer className="p-4">
      {activeTab === "notes" ? (
        <FlatList
          data={sharedNotes}
          keyExtractor={(item) => item.id.toString()}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={{ paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            !notesLoading ? (
              <View className="items-center py-10">
                <Text className="text-muted italic" style={{ fontFamily: 'serif' }}>No scrolls found in the archives</Text>
              </View>
            ) : null
          }
          renderItem={({ item }) => {
            const isMe = item.authorId === user?.id;
            return (
              <View className={`mb-4 overflow-hidden border ${isMe ? "border-primary bg-surface/50 ml-6" : "border-border bg-surface mr-6"}`}>
                <View className={`px-4 py-2 flex-row justify-between items-center ${isMe ? "bg-primary/10" : "bg-border/20"}`}>
                  <Text className={`text-xs font-bold ${isMe ? "text-primary" : "text-foreground"}`} style={{ fontFamily: 'serif' }}>
                    {isMe ? "YOU" : (item.authorName?.toUpperCase() || "CO-OWNER")}
                  </Text>
                  <Text className="text-[10px] text-muted" style={{ fontFamily: 'serif' }}>
                    {new Date(item.createdAt).toLocaleDateString()}
                  </Text>
                </View>
                <View className="p-4">
                  <View className="mb-2 self-start bg-primary/20 px-2 py-0.5 border border-primary/30">
                    <Text className="text-[9px] font-bold text-primary uppercase" style={{ fontFamily: 'serif' }}>
                      {item.category.replace("_", " ")}
                    </Text>
                  </View>
                  <Text className="text-sm text-foreground leading-6" style={{ fontFamily: 'serif' }}>{item.content}</Text>
                </View>
              </View>
            );
          }}
        />
      ) : (
        <FlatList
          data={activity}
          keyExtractor={(item) => item.id.toString()}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={{ paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            !activityLoading ? (
              <View className="items-center py-10">
                <Text className="text-muted italic" style={{ fontFamily: 'serif' }}>The ledger is empty</Text>
              </View>
            ) : null
          }
          renderItem={({ item }) => (
            <View className="bg-surface border-l-4 border-l-primary border border-border p-4 mb-3">
              <View className="flex-row items-start justify-between">
                <View className="flex-1">
                  <Text className="text-sm font-bold text-primary uppercase tracking-tighter" style={{ fontFamily: 'serif' }}>
                    {item.action.replace(/_/g, " ")}
                  </Text>
                  {item.description && (
                    <Text className="text-sm text-foreground mt-1" style={{ fontFamily: 'serif' }}>{item.description}</Text>
                  )}
                  <Text className="text-[10px] text-muted mt-3 italic" style={{ fontFamily: 'serif' }}>
                    {new Date(item.createdAt).toLocaleString()}
                  </Text>
                </View>
              </View>
            </View>
          )}
        />
      )}

      {(notesLoading || activityLoading) && (
        <View className="absolute inset-0 items-center justify-center bg-background/50">
          <ActivityIndicator size="large" color="#D4AF37" />
        </View>
      )}
    </ScreenContainer>
  );
}
