import { createContext, useContext, useState, type ReactNode } from 'react';
import { googleLogout } from '@react-oauth/google';

interface User {
  id: string;
  username: string;
  role: 'ADMIN' | 'REFEREE';
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, role: 'ADMIN' | 'REFEREE', username: string, id: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
  // Google Auth
  googleUser: GoogleUser | null;
  loginGoogle: (user: GoogleUser) => void;
  logoutGoogle: () => void;
}

interface GoogleUser {
  email: string;
  name: string;
  picture: string;
  sub: string;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('user');
    try {
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));

  // Google State
  const [googleUser, setGoogleUser] = useState<GoogleUser | null>(() => {
    const saved = localStorage.getItem('google_user');
    try {
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const login = (newToken: string, role: 'ADMIN' | 'REFEREE', username: string, id: string) => {
    const userData: User = { id, username, role };
    setToken(newToken);
    setUser(userData);
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const loginGoogle = (userData: GoogleUser) => {
    setGoogleUser(userData);
    localStorage.setItem('google_user', JSON.stringify(userData));
  };

  const logoutGoogle = () => {
    googleLogout();
    setGoogleUser(null);
    localStorage.removeItem('google_user');
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      login,
      logout,
      isAuthenticated: !!token,
      googleUser,
      loginGoogle,
      logoutGoogle
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
