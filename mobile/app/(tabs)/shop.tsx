import { ScrollView, Text, View, TouchableOpacity, FlatList, ActivityIndicator } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { trpc } from "@/lib/trpc";
import { useState } from "react";

/**
 * Shop Management Tab - Monitor the territory's economy
 * Styled with a Medieval/Celtic theme.
 */
export default function ShopScreen() {
  const [activeTab, setActiveTab] = useState<"sales" | "orders" | "members">("sales");

  const { data: salesStats, isLoading: salesLoading } = trpc.sales.stats.useQuery();
  const { data: orders = [], isLoading: ordersLoading } = trpc.orders.list.useQuery();
  const { data: members = [], isLoading: membersLoading } = trpc.members.list.useQuery();

  const renderHeader = () => (
    <View className="gap-6 mb-6">
      <View className="gap-1 items-center">
        <Text className="text-3xl font-bold text-primary tracking-widest" style={{ fontFamily: 'serif' }}>
          TUATH COIR
        </Text>
        <View className="h-[1px] w-full bg-border" />
        <Text className="text-lg font-semibold text-foreground mt-2" style={{ fontFamily: 'serif' }}>
          Kingdom Management
        </Text>
        <Text className="text-xs text-muted italic" style={{ fontFamily: 'serif' }}>
          Treasury • Tributes • Tribe
        </Text>
      </View>

      <View className="flex-row gap-0 bg-surface border border-border p-1">
        {(["sales", "orders", "members"] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            className={`flex-1 py-3 ${activeTab === tab ? "bg-primary" : "bg-transparent"}`}
            onPress={() => setActiveTab(tab)}
          >
            <Text className={`text-[10px] font-bold text-center uppercase ${activeTab === tab ? "text-background" : "text-foreground"}`} style={{ fontFamily: 'serif' }}>
              {tab === 'sales' ? 'Treasury' : tab === 'orders' ? 'Tributes' : 'Tribe'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <ScreenContainer className="p-4">
      {activeTab === "sales" && (
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {renderHeader()}
          {salesLoading ? (
            <ActivityIndicator color="#D4AF37" />
          ) : (
            <View className="gap-4 pb-10">
              <View className="bg-surface p-8 border-2 border-primary items-center shadow-2xl">
                <Text className="text-primary text-xs uppercase font-bold tracking-[4px] mb-3" style={{ fontFamily: 'serif' }}>Kingdom Wealth</Text>
                <Text className="text-foreground text-5xl font-black" style={{ fontFamily: 'serif' }}>
                  ${salesStats?.summary?.totalRevenue?.toFixed(2) || '0.00'}
                </Text>
                <View className="h-[1px] w-20 bg-border mt-4" />
              </View>

              <View className="flex-row gap-4">
                <View className="flex-1 bg-surface p-5 border border-border">
                  <Text className="text-muted text-[10px] uppercase font-bold tracking-widest mb-1" style={{ fontFamily: 'serif' }}>Tributes</Text>
                  <Text className="text-foreground text-2xl font-bold" style={{ fontFamily: 'serif' }}>{salesStats?.summary?.totalOrders || 0}</Text>
                </View>
                <View className="flex-1 bg-surface p-5 border border-primary/50">
                  <Text className="text-primary text-[10px] uppercase font-bold tracking-widest mb-1" style={{ fontFamily: 'serif' }}>Net Profit</Text>
                  <Text className="text-foreground text-2xl font-bold" style={{ fontFamily: 'serif' }}>${salesStats?.summary?.totalProfit?.toFixed(2) || '0.00'}</Text>
                </View>
              </View>

              <Text className="text-primary font-bold mt-6 mb-2 tracking-widest" style={{ fontFamily: 'serif' }}>RECENT TRIBUTES</Text>
              {salesStats?.recent.map((sale: any, i: number) => (
                <View key={i} className="flex-row justify-between bg-surface p-4 border border-border mb-2">
                  <Text className="text-foreground font-bold" style={{ fontFamily: 'serif' }}>+ ${sale.totalAmount.toFixed(2)}</Text>
                  <Text className="text-muted text-xs" style={{ fontFamily: 'serif' }}>{new Date(sale.createdAt).toLocaleDateString()}</Text>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      )}

      {activeTab === "orders" && (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id.toString()}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={{ paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View className="bg-surface p-5 border border-border mb-4">
              <View className="flex-row justify-between mb-3">
                <Text className="text-primary font-black tracking-widest" style={{ fontFamily: 'serif' }}>{item.orderNumber}</Text>
                <View className={`px-2 py-0.5 border ${item.paymentStatus === 'paid' ? 'border-primary bg-primary/10' : 'border-red-900 bg-red-900/10'}`}>
                  <Text className={`text-[9px] font-bold ${item.paymentStatus === 'paid' ? 'text-primary' : 'text-red-500'}`} style={{ fontFamily: 'serif' }}>
                    {item.paymentStatus.toUpperCase()}
                  </Text>
                </View>
              </View>
              <Text className="text-foreground text-sm opacity-80" style={{ fontFamily: 'serif' }}>{item.customerEmail}</Text>
              <View className="flex-row justify-between mt-4 items-end">
                <Text className="text-foreground text-xl font-bold" style={{ fontFamily: 'serif' }}>${item.totalAmount.toFixed(2)}</Text>
                <Text className="text-[10px] text-muted uppercase font-bold" style={{ fontFamily: 'serif' }}>{item.status}</Text>
              </View>
            </View>
          )}
        />
      )}

      {activeTab === "members" && (
        <FlatList
          data={members}
          keyExtractor={(item) => item.id.toString()}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={{ paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View className="bg-surface p-5 border border-border mb-4">
              <View className="flex-row justify-between items-center">
                <Text className="text-foreground font-bold text-lg" style={{ fontFamily: 'serif' }}>{item.name.toUpperCase()}</Text>
                <View className="bg-primary/10 px-2 py-1 border border-primary/30">
                  <Text className="text-primary text-[10px] font-bold tracking-widest" style={{ fontFamily: 'serif' }}>{item.territory.toUpperCase()}</Text>
                </View>
              </View>
              <Text className="text-muted text-sm mt-2 font-medium" style={{ fontFamily: 'serif' }}>{item.email}</Text>
              <Text className="text-muted text-[9px] mt-4 uppercase tracking-tighter" style={{ fontFamily: 'serif' }}>Joined the tribe: {new Date(item.createdAt).toLocaleDateString()}</Text>
            </View>
          )}
        />
      )}
    </ScreenContainer>
  );
}
