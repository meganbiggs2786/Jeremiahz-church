import { ScrollView, Text, View, TouchableOpacity, FlatList, ActivityIndicator } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { trpc } from "@/lib/trpc";
import { useState } from "react";

export default function ShopScreen() {
  const [activeTab, setActiveTab] = useState<"sales" | "orders" | "members">("sales");

  const { data: salesStats, isLoading: salesLoading } = trpc.sales.stats.useQuery();
  const { data: orders = [], isLoading: ordersLoading } = trpc.orders.list.useQuery();
  const { data: members = [], isLoading: membersLoading } = trpc.members.list.useQuery();

  return (
    <ScreenContainer className="p-6">
      <View className="gap-4 flex-1">
        <View className="gap-2">
          <Text className="text-2xl font-bold text-foreground">Shop Management</Text>
          <Text className="text-sm text-muted">Monitor your territory's economy</Text>
        </View>

        <View className="flex-row gap-2 bg-surface rounded-lg p-1">
          {(["sales", "orders", "members"] as const).map((tab) => (
            <TouchableOpacity
              key={tab}
              className={`flex-1 py-2 rounded-md ${activeTab === tab ? "bg-primary" : ""}`}
              onPress={() => setActiveTab(tab)}
            >
              <Text className={`text-xs font-semibold text-center capitalize ${activeTab === tab ? "text-white" : "text-foreground"}`}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {activeTab === "sales" && (
          <ScrollView className="flex-1 gap-4">
            {salesLoading ? (
              <ActivityIndicator />
            ) : (
              <View className="gap-4">
                <View className="bg-surface p-6 rounded-xl border border-border items-center">
                  <Text className="text-muted text-xs uppercase tracking-widest mb-2">Total Revenue</Text>
                  <Text className="text-white text-4xl font-bold">${salesStats?.summary?.totalRevenue?.toFixed(2) || '0.00'}</Text>
                </View>

                <View className="flex-row gap-4">
                  <View className="flex-1 bg-surface p-4 rounded-xl border border-border">
                    <Text className="text-muted text-[10px] uppercase tracking-widest mb-1">Orders</Text>
                    <Text className="text-white text-xl font-bold">{salesStats?.summary?.totalOrders || 0}</Text>
                  </View>
                  <View className="flex-1 bg-surface p-4 rounded-xl border border-border">
                    <Text className="text-muted text-[10px] uppercase tracking-widest mb-1">Profit</Text>
                    <Text className="text-primary text-xl font-bold">${salesStats?.summary?.totalProfit?.toFixed(2) || '0.00'}</Text>
                  </View>
                </View>

                <Text className="text-foreground font-bold mt-4">Recent Sales</Text>
                {salesStats?.recent.map((sale: any, i: number) => (
                  <View key={i} className="flex-row justify-between bg-surface p-4 rounded border border-border">
                    <Text className="text-white font-medium">${sale.totalAmount.toFixed(2)}</Text>
                    <Text className="text-muted text-xs">{new Date(sale.createdAt).toLocaleDateString()}</Text>
                  </View>
                ))}
              </View>
            )}
          </ScrollView>
        )}

        {activeTab === "orders" && (
          <View className="flex-1">
            {ordersLoading ? (
              <ActivityIndicator />
            ) : (
              <FlatList
                data={orders}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                  <View className="bg-surface p-4 rounded-lg border border-border mb-3">
                    <View className="flex-row justify-between mb-2">
                      <Text className="text-white font-bold">{item.orderNumber}</Text>
                      <Text className={`text-xs ${item.paymentStatus === 'paid' ? 'text-primary' : 'text-red-500'}`}>
                        {item.paymentStatus.toUpperCase()}
                      </Text>
                    </View>
                    <Text className="text-muted text-sm">{item.customerEmail}</Text>
                    <View className="flex-row justify-between mt-2 items-center">
                      <Text className="text-white">${item.totalAmount.toFixed(2)}</Text>
                      <View className="bg-border px-2 py-1 rounded">
                        <Text className="text-[10px] text-muted">{item.status}</Text>
                      </View>
                    </View>
                  </View>
                )}
              />
            )}
          </View>
        )}

        {activeTab === "members" && (
          <View className="flex-1">
            {membersLoading ? (
              <ActivityIndicator />
            ) : (
              <FlatList
                data={members}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                  <View className="bg-surface p-4 rounded-lg border border-border mb-3">
                    <View className="flex-row justify-between">
                      <Text className="text-white font-bold">{item.name}</Text>
                      <Text className="text-primary text-xs tracking-tighter">{item.territory}</Text>
                    </View>
                    <Text className="text-muted text-sm mt-1">{item.email}</Text>
                    <Text className="text-muted text-[10px] mt-2">Joined: {new Date(item.createdAt).toLocaleDateString()}</Text>
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
