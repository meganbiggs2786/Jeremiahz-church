import { ScrollView, Text, View, TouchableOpacity, FlatList, ActivityIndicator, TextInput, Modal } from "react-native";
import { useAuth } from "@/hooks/use-auth";
import { ScreenContainer } from "@/components/screen-container";
import { trpc } from "@/lib/trpc";
import { useState } from "react";

/**
 * Tuath Coir Command Center
 * Tactical Dashboard for managing products and viewing business metrics
 */
export default function ProductsScreen() {
  const { isAuthenticated } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<"all" | "hoodies" | "apparel" | "hygiene_kits">("all");

  // Profile State
  const [luckyLady, setLuckyLady] = useState("Joy");
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [tempLuckyLady, setTempLuckyLady] = useState(luckyLady);

  // Fetch Data
  const { data: products = [], isLoading: productsLoading } = trpc.products.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const { data: stats, isLoading: statsLoading } = trpc.stats.get.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const { data: recentOrders = [], isLoading: ordersLoading } = trpc.orders.recent.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const isLoading = productsLoading || statsLoading || ordersLoading;

  const filteredProducts = selectedCategory === "all"
    ? products
    : products.filter((p) => p.category === selectedCategory);

  const categories = [
    { id: "all", label: "All Arsenal" },
    { id: "hoodies", label: "Hoodies" },
    { id: "apparel", label: "Apparel" },
    { id: "hygiene_kits", label: "Hygiene Kits" },
  ];

  if (!isAuthenticated) {
    return (
      <ScreenContainer className="items-center justify-center bg-black">
        <Text className="text-white font-bold">⚔️ ACCESS DENIED ⚔️</Text>
        <Text className="text-gray-500 mt-2">Authentication Required for Command Center</Text>
      </ScreenContainer>
    );
  }

  const StatPanel = ({ title, data }: { title: string, data: { label: string, value: string | number, isProfit?: boolean }[] }) => (
    <View className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl mb-4">
      <Text className="text-zinc-500 text-xs font-bold mb-3 uppercase tracking-widest">{title}</Text>
      <View className="gap-2">
        {data.map((item, index) => (
          <View key={index} className="flex-row justify-between items-center">
            <Text className="text-zinc-400 text-sm">{item.label}</Text>
            <Text className={`font-bold ${item.isProfit ? "text-[#FFD700]" : "text-white"}`}>
              {item.isProfit ? `$${item.value}` : item.value}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );

  return (
    <ScreenContainer className="p-4 bg-black">
      <View className="flex-1 pb-10">
        {/* Header */}
        <View className="flex-row justify-between items-start mb-6">
          <View>
            <Text className="text-xl font-black text-white tracking-tighter">⚔️ TUATH COIR COMMAND CENTER ⚔️</Text>
            <Text className="text-[10px] text-zinc-500 uppercase tracking-widest mt-1">
              Ancient Celtic Roots • Street Justice
            </Text>
          </View>
          <View className="items-end">
            <Text className="text-[10px] text-zinc-500 text-right">
              {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
            </Text>
            <TouchableOpacity onPress={() => setIsEditingProfile(true)}>
              <Text className="text-[10px] text-zinc-400 font-bold mt-1">
                Owners: Megan & <Text className="text-[#FFD700]">{luckyLady}</Text> ✎
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {isLoading ? (
          <View className="flex-1 items-center justify-center py-20">
            <ActivityIndicator color="#FFD700" size="large" />
            <Text className="text-zinc-500 mt-4 font-bold tracking-widest">INITIALIZING SYSTEMS...</Text>
          </View>
        ) : (
          <>
            {/* Alerts */}
            {stats && stats.pending_orders > 0 && (
              <View className="bg-red-900/20 border border-red-900 p-3 rounded-lg mb-6 flex-row items-center">
                <Text className="text-red-500 font-bold text-xs">⚠️ {stats.pending_orders} ORDERS PENDING PAYMENT</Text>
              </View>
            )}

            {/* Stats Grid */}
            <View className="flex-row gap-4 mb-2">
               <View className="flex-1">
                  <StatPanel
                    title="Today"
                    data={[
                      { label: "Orders", value: stats?.today_orders || 0 },
                      { label: "Profit", value: stats?.today_profit || "0.00", isProfit: true }
                    ]}
                  />
               </View>
               <View className="flex-1">
                  <StatPanel
                    title="7 Days"
                    data={[
                      { label: "Orders", value: stats?.week_orders || 0 },
                      { label: "Profit", value: stats?.week_profit || "0.00", isProfit: true }
                    ]}
                  />
               </View>
            </View>

            <StatPanel
              title="All Time Performance"
              data={[
                { label: "Total Revenue", value: `$${stats?.total_revenue || "0.00"}` },
                { label: "Total Profit", value: stats?.total_profit || "0.00", isProfit: true },
                { label: "Profit Margin", value: "68%" }
              ]}
            />

            {/* Integrations */}
            <View className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl mb-6">
              <Text className="text-zinc-500 text-xs font-bold mb-3 uppercase tracking-widest">🔌 Integrations</Text>
              <View className="flex-row flex-wrap gap-2">
                {Object.entries(stats?.integrations || {}).map(([key, value]) => (
                  <View key={key} className={`px-2 py-1 rounded border ${value ? "bg-green-900/10 border-green-900" : "bg-zinc-800 border-zinc-700"}`}>
                    <Text className={`text-[9px] font-bold uppercase ${value ? "text-green-500" : "text-zinc-500"}`}>
                      {key}: {value ? "ONLINE" : "OFFLINE"}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Recent Orders */}
            <View className="mb-8">
              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-lg font-bold text-white uppercase tracking-tighter">📦 Recent Operations</Text>
                <TouchableOpacity>
                  <Text className="text-[#FFD700] text-xs font-bold">VIEW ALL</Text>
                </TouchableOpacity>
              </View>
              {recentOrders.length === 0 ? (
                <View className="bg-zinc-900 p-8 rounded-xl items-center border border-dashed border-zinc-800">
                  <Text className="text-zinc-600">No active operations</Text>
                </View>
              ) : (
                recentOrders.map((order) => (
                  <View key={order.id} className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl mb-3">
                    <View className="flex-row justify-between mb-2">
                      <Text className="text-white font-bold">{order.id}</Text>
                      <Text className="text-[#FFD700] font-bold">${order.profit_amount.toFixed(2)} PROFIT</Text>
                    </View>
                    <View className="flex-row justify-between items-center">
                      <View>
                        <Text className="text-zinc-400 text-xs">{order.customer_name}</Text>
                        <Text className="text-zinc-600 text-[10px]">{order.customer_email}</Text>
                      </View>
                      <View className={`px-2 py-1 rounded-full ${order.payment_status === 'paid' ? 'bg-green-900/20' : 'bg-yellow-900/20'}`}>
                        <Text className={`text-[8px] font-black uppercase ${order.payment_status === 'paid' ? 'text-green-500' : 'text-yellow-500'}`}>
                          {order.payment_status}
                        </Text>
                      </View>
                    </View>
                  </View>
                ))
              )}
            </View>

            {/* Arsenal / Product Management */}
            <View className="mb-4">
              <Text className="text-lg font-bold text-white uppercase tracking-tighter mb-4">⚒️ The Arsenal</Text>

              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
                <View className="flex-row gap-2">
                  {categories.map((cat) => (
                    <TouchableOpacity
                      key={cat.id}
                      className={`px-4 py-2 rounded-lg border ${
                        selectedCategory === cat.id
                          ? "bg-[#FFD700] border-[#FFD700]"
                          : "bg-zinc-900 border-zinc-800"
                      }`}
                      onPress={() => setSelectedCategory(cat.id as any)}
                    >
                      <Text
                        className={`text-xs font-black uppercase ${
                          selectedCategory === cat.id ? "text-black" : "text-zinc-400"
                        }`}
                      >
                        {cat.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>

              {filteredProducts.length === 0 ? (
                <View className="bg-zinc-900 p-10 rounded-xl items-center border border-dashed border-zinc-800">
                  <Text className="text-zinc-500 font-bold mb-4">ARSENAL EMPTY</Text>
                  <TouchableOpacity className="bg-[#FFD700] px-6 py-3 rounded-lg">
                    <Text className="text-black font-black uppercase text-xs">Forge New Item</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View className="gap-3">
                  {filteredProducts.map((item) => (
                    <View key={item.id} className="bg-zinc-900 rounded-xl p-4 border border-zinc-800">
                      <View className="flex-row justify-between items-start mb-2">
                        <View className="flex-1">
                          <Text className="text-white font-bold text-md">{item.name}</Text>
                          <Text className="text-zinc-500 text-[10px] uppercase tracking-widest">{item.category.replace("_", " ")}</Text>
                        </View>
                        <View className={`px-2 py-1 rounded border ${item.status === 'active' ? 'border-green-900 bg-green-900/10' : 'border-zinc-700 bg-zinc-800'}`}>
                          <Text className={`text-[8px] font-black uppercase ${item.status === 'active' ? 'text-green-500' : 'text-zinc-500'}`}>
                            {item.status.replace("_", " ")}
                          </Text>
                        </View>
                      </View>
                      <Text className="text-zinc-400 text-xs mb-4" numberOfLines={2}>{item.description}</Text>
                      <View className="flex-row gap-2">
                        <TouchableOpacity className="flex-1 bg-zinc-800 rounded-lg py-2 border border-zinc-700">
                          <Text className="text-white text-xs font-bold text-center uppercase">Adjust</Text>
                        </TouchableOpacity>
                        <TouchableOpacity className="flex-1 bg-red-900/20 rounded-lg py-2 border border-red-900">
                          <Text className="text-red-500 text-xs font-bold text-center uppercase">Decommission</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}

                  <TouchableOpacity className="bg-[#FFD700] rounded-xl py-4 mt-2 items-center">
                    <Text className="text-black font-black uppercase tracking-widest">Forge New Item</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* Quick Actions */}
            <View className="mt-8 gap-3">
              <Text className="text-xs font-bold text-zinc-600 uppercase tracking-[4px] mb-1">Tactical Links</Text>
              <View className="flex-row gap-3">
                <TouchableOpacity className="flex-1 bg-zinc-900 p-4 rounded-xl border border-zinc-800 items-center">
                  <Text className="text-white text-xs font-bold uppercase">Stripe</Text>
                </TouchableOpacity>
                <TouchableOpacity className="flex-1 bg-zinc-900 p-4 rounded-xl border border-zinc-800 items-center">
                  <Text className="text-white text-xs font-bold uppercase">Storefront</Text>
                </TouchableOpacity>
              </View>
            </View>
          </>
        )}
      </View>

      {/* Profile Edit Modal */}
      <Modal
        visible={isEditingProfile}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsEditingProfile(false)}
      >
        <View className="flex-1 bg-black/80 items-center justify-center p-6">
          <View className="bg-zinc-900 border border-[#FFD700] p-6 rounded-2xl w-full max-w-sm">
            <Text className="text-white font-black text-lg mb-2 uppercase tracking-tight">Modify Command</Text>
            <Text className="text-zinc-500 text-xs mb-6 uppercase">Assign Second Tactical Owner</Text>

            <View className="mb-6">
              <Text className="text-zinc-400 text-[10px] uppercase font-bold mb-2">Name (Fixed)</Text>
              <View className="bg-zinc-800 p-3 rounded-lg border border-zinc-700">
                <Text className="text-zinc-500 font-bold">Megan</Text>
              </View>
            </View>

            <View className="mb-8">
              <Text className="text-[#FFD700] text-[10px] uppercase font-bold mb-2">Lucky Lady Name</Text>
              <TextInput
                className="bg-zinc-800 p-3 rounded-lg border border-[#FFD700] text-white font-bold"
                value={tempLuckyLady}
                onChangeText={setTempLuckyLady}
                placeholder="Enter Name"
                placeholderTextColor="#555"
              />
            </View>

            <View className="flex-row gap-3">
              <TouchableOpacity
                className="flex-1 bg-zinc-800 p-4 rounded-xl border border-zinc-700"
                onPress={() => {
                  setIsEditingProfile(false);
                  setTempLuckyLady(luckyLady);
                }}
              >
                <Text className="text-white text-center font-bold uppercase text-xs">Abort</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 bg-[#FFD700] p-4 rounded-xl"
                onPress={() => {
                  setLuckyLady(tempLuckyLady);
                  setIsEditingProfile(false);
                }}
              >
                <Text className="text-black text-center font-black uppercase text-xs">Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}
