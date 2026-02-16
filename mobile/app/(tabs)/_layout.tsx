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
          backgroundColor: '#000',
          borderTopColor: '#222',
        },
        tabBarActiveTintColor: '#006400',
        tabBarInactiveTintColor: '#888',
      }}
    >
      <Tabs.Screen
        name="collaborate"
        options={{
          title: 'Collaborate',
          // tabIcon: (props) => <Icon {...props} name="message-square" />
        }}
      />
      <Tabs.Screen
        name="shop"
        options={{
          title: 'Shop',
          // tabIcon: (props) => <Icon {...props} name="shopping-bag" />
        }}
      />
    </Tabs>
  );
}
