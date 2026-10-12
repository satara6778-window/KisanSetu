import React, { createContext, useContext, useState, useEffect } from 'react';

export type UserRole = 'FARMER' | 'CONSUMER' | 'WHOLESALER' | 'ADMIN';

export interface User {
  id: number;
  phone: string;
  fullName: string;
  role: UserRole;
  village: string;
  district: string;
  state: string;
  preferredLanguage: string;
  blocked: boolean;
}

export interface DemoPersona {
  phone: string;
  name: string;
  role: UserRole;
  location: string;
  label: string;
}

export const DEMO_PERSONAS: DemoPersona[] = [
  { phone: '9876543210', name: 'Ramesh Patil', role: 'FARMER', location: 'Manchar, Pune', label: '👨‍🌾 Ramesh Patil (Farmer)' },
  { phone: '9876543211', name: 'Suresh Shinde', role: 'FARMER', location: 'Lasalgaon, Nashik', label: '👩‍🌾 Suresh Shinde (Farmer)' },
  { phone: '9876543220', name: 'Pooja Deshmukh', role: 'CONSUMER', location: 'Kothrud, Pune', label: '🛒 Pooja Deshmukh (Consumer)' },
  { phone: '9876543230', name: 'Apex Fresh Produce Ltd', role: 'WHOLESALER', location: 'Vashi, Mumbai', label: '🏢 Apex Agri (Wholesaler)' },
  { phone: '9999999999', name: 'Platform Admin', role: 'ADMIN', location: 'Pune', label: '🛡️ Admin & Support' },
];

interface AuthContextType {
  user: User;
  token: string | null;
  role: UserRole;
  switchPersona: (phone: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User>(() => {
    const saved = localStorage.getItem('kisansetu_user');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    // Default to Ramesh Patil (Farmer)
    return {
      id: 1,
      phone: '9876543210',
      fullName: 'Ramesh Patil',
      role: 'FARMER',
      village: 'Manchar',
      district: 'Pune',
      state: 'Maharashtra',
      preferredLanguage: 'mr',
      blocked: false
    };
  });

  const [token, setToken] = useState<string | null>(() => localStorage.getItem('kisansetu_token'));

  useEffect(() => {
    localStorage.setItem('kisansetu_user', JSON.stringify(user));
  }, [user]);

  const switchPersona = (phone: string) => {
    const persona = DEMO_PERSONAS.find(p => p.phone === phone);
    if (persona) {
      const updatedUser: User = {
        id: persona.role === 'FARMER' ? (persona.phone.endsWith('0') ? 1 : 2) : (persona.role === 'CONSUMER' ? 3 : (persona.role === 'WHOLESALER' ? 4 : 5)),
        phone: persona.phone,
        fullName: persona.name,
        role: persona.role,
        village: persona.location.split(',')[0].trim(),
        district: persona.location.split(',')[1]?.trim() || 'Pune',
        state: 'Maharashtra',
        preferredLanguage: persona.role === 'FARMER' ? 'mr' : 'en',
        blocked: false
      };
      setUser(updatedUser);
      setToken(`demo-jwt-${persona.phone}`);
      localStorage.setItem('kisansetu_token', `demo-jwt-${persona.phone}`);
    }
  };

  const logout = () => {
    // Switch back to the default farmer persona so that farmer-facing pages
    // (like My Listings) work immediately after logout without a 403.
    switchPersona('9876543210'); // Ramesh Patil (FARMER)
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      role: user.role,
      switchPersona,
      logout,
      isAuthenticated: true
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
