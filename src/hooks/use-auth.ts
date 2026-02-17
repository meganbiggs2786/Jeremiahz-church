import { useState } from 'react';

export function useAuth() {
  // Mocked authenticated state for the purpose of the dashboard
  const [isAuthenticated] = useState(true);

  return {
    isAuthenticated,
    user: {
      id: '1',
      name: 'Admin User',
    },
  };
}
