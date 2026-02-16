import { View, SafeAreaView, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';

export function ScreenContainer({ children, className = "" }: { children: React.ReactNode, className?: string }) {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <StatusBar style="light" />
      <View className={`flex-1 ${className}`}>
        {children}
      </View>
    </SafeAreaView>
  );
}
