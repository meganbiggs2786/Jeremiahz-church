import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';

export default function LoginScreen() {
  const [name, setName] = useState('');
  const [key, setKey] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const router = useRouter();

  const handleLogin = () => {
    if (login(name, key)) {
      router.replace('/(tabs)/collaborate');
    } else {
      setError('The runes do not align. Invalid Key or Name.');
    }
  };

  return (
    <ScreenContainer className="justify-center p-8">
      <View className="items-center mb-12">
        <View className="w-24 h-24 border-4 border-primary items-center justify-center mb-6 shadow-2xl bg-surface">
          <Text className="text-primary text-4xl font-black" style={{ fontFamily: 'serif' }}>TC</Text>
        </View>
        <Text className="text-primary text-3xl font-bold tracking-[8px]" style={{ fontFamily: 'serif' }}>TUATH COIR</Text>
        <View className="h-[1px] w-32 bg-border my-2" />
        <Text className="text-foreground text-sm tracking-[4px] uppercase opacity-80" style={{ fontFamily: 'serif' }}>Owner Portal</Text>
      </View>

      <View className="gap-6">
        <View>
          <Text className="text-primary text-xs uppercase mb-2 font-bold tracking-widest" style={{ fontFamily: 'serif' }}>Identity</Text>
          <TextInput
            className="bg-surface border border-border p-4 text-foreground text-lg"
            placeholder="Your Name"
            placeholderTextColor="#5C4033"
            value={name}
            onChangeText={setName}
            style={{ fontFamily: 'serif' }}
          />
        </View>

        <View>
          <Text className="text-primary text-xs uppercase mb-2 font-bold tracking-widest" style={{ fontFamily: 'serif' }}>Secret Rune</Text>
          <TextInput
            className="bg-surface border border-border p-4 text-foreground text-lg"
            placeholder="••••••••"
            placeholderTextColor="#5C4033"
            secureTextEntry
            value={key}
            onChangeText={setKey}
            style={{ fontFamily: 'serif' }}
          />
        </View>

        {error ? <Text className="text-red-800 text-sm text-center font-bold" style={{ fontFamily: 'serif' }}>{error}</Text> : null}

        <TouchableOpacity
          className="bg-primary p-5 mt-4 active:opacity-80 border border-gold shadow-lg"
          onPress={handleLogin}
        >
          <Text className="text-background text-center font-black text-lg tracking-[2px]" style={{ fontFamily: 'serif' }}>ENTER TERRITORY</Text>
        </TouchableOpacity>
      </View>

      <View className="mt-20 items-center">
        <Text className="text-muted text-[10px] text-center uppercase tracking-[4px] leading-5" style={{ fontFamily: 'serif' }}>
          Ancient Roots.{"\n"}Unified Tribe.{"\n"}Protect Your Own.
        </Text>
      </View>
    </ScreenContainer>
  );
}
