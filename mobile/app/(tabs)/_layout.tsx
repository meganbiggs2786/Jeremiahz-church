import { Tabs } from 'expo-router';
import { useAuth } from '@/hooks/use-auth';
import { Redirect } from 'expo-router';

export default function TabLayout() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Redirect href="/" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#1A0F0A',
          borderTopColor: '#5C4033',
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
        },
        tabBarActiveTintColor: '#D4AF37',
        tabBarInactiveTintColor: '#5C4033',
        tabBarLabelStyle: {
          fontFamily: 'serif',
          fontWeight: 'bold',
          fontSize: 12,
        }
      }}
    >
      <Tabs.Screen
        name="collaborate"
        options={{
          title: 'SCROLLS',
        }}
      />
      <Tabs.Screen
        name="shop"
        options={{
          title: 'KINGDOM',
        }}
      />
    </Tabs>
  );
}
