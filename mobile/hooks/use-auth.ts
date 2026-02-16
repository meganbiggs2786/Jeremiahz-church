import { useState, createContext, useContext } from 'react';

type User = {
  id: string;
  name: string;
};

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  login: (name: string, key: string) => boolean;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  login: () => false,
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = (name: string, key: string) => {
    // In a real app, the key would be validated against the server
    // For this task, we use a shared owner key
    const VALID_KEY = 'tc_owner_secret_2024';

    if (key === VALID_KEY) {
      const id = name.toLowerCase().includes('megan') ? 'megan' : 'lucky_lady';
      setUser({ id, name });
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
