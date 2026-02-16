import { View, Text, TextInput, TouchableOpacity, Image } from 'react-native';
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
      setError('Invalid Owner Key or Name');
    }
  };

  return (
    <ScreenContainer className="justify-center p-8">
      <View className="items-center mb-10">
        <View className="w-20 h-20 border-2 border-white items-center justify-center mb-4">
          <Text className="text-white text-3xl font-bold">TC</Text>
        </View>
        <Text className="text-white text-2xl font-bold tracking-[5px]">TUATH COIR</Text>
        <Text className="text-muted text-xs tracking-[2px] mt-1">OWNER PORTAL</Text>
      </View>

      <View className="gap-4">
        <View>
          <Text className="text-muted text-xs uppercase mb-2">Owner Name</Text>
          <TextInput
            className="bg-surface border border-border p-4 text-white rounded"
            placeholder="Megan / Lucky Lady"
            placeholderTextColor="#444"
            value={name}
            onChangeText={setName}
          />
        </View>

        <View>
          <Text className="text-muted text-xs uppercase mb-2">Owner Secret Key</Text>
          <TextInput
            className="bg-surface border border-border p-4 text-white rounded"
            placeholder="••••••••"
            placeholderTextColor="#444"
            secureTextEntry
            value={key}
            onChangeText={setKey}
          />
        </View>

        {error ? <Text className="text-red-500 text-sm text-center">{error}</Text> : null}

        <TouchableOpacity
          className="bg-white p-4 rounded mt-4 active:opacity-80"
          onPress={handleLogin}
        >
          <Text className="text-black text-center font-bold uppercase tracking-[2px]">Enter Territory</Text>
        </TouchableOpacity>
      </View>

      <Text className="text-muted text-[10px] text-center mt-20 uppercase tracking-widest">
        Ancient Celtic Roots. Protect Your Own.
      </Text>
    </ScreenContainer>
  );
}
