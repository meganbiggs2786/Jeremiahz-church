import { View, ScrollView, SafeAreaView, StatusBar } from "react-native";
import { ReactNode } from "react";

interface ScreenContainerProps {
  children: ReactNode;
  className?: string;
  scrollable?: boolean;
}

export function ScreenContainer({ children, className = "", scrollable = true }: ScreenContainerProps) {
  const Container = scrollable ? ScrollView : View;

  return (
    <SafeAreaView className="flex-1 bg-black">
      <StatusBar barStyle="light-content" />
      <Container
        className={`flex-1 ${className}`}
        contentContainerStyle={scrollable ? { flexGrow: 1 } : undefined}
      >
        {children}
      </Container>
    </SafeAreaView>
  );
}
