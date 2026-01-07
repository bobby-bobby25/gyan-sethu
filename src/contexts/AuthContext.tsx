import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import api from "@/api/api";

export type AppRole = "admin" | "management" | "teacher";

interface AuthUser {
  id: number;
  email: string;
  role: AppRole;
}

interface AuthContextType {
  user: AuthUser | null;
  userRole: AppRole;
  profile: { id: string; email: string; full_name: string; } | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [userRole, setRole] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // 🔁 Restore session from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("auth_user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const signIn = async (email: string, password: string) => {
    const { data } = await api.post("/Login/CheckLoginDetails", {
      userName: email,
      password,
    });

    localStorage.setItem("access_token", data.accessToken);
    localStorage.setItem("refresh_token", data.refreshToken);
    localStorage.setItem("auth_user", JSON.stringify(data.user));

    setUser(data.user);
    setRole(data.user.role);
    setProfile(data.userProfile);
    console.log('Profile', profile);
  };

  const signOut = () => {
    localStorage.clear();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, userRole, profile, isLoading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
