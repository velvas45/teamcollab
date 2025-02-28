"use client";

import type React from "react";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type User = {
  name?: string;
  room?: string;
  token?: string;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  userRooms: {
    [key: string]: {
      online: boolean;
      socketId: string;
    };
  } | null;
  setUserRooms: React.Dispatch<
    React.SetStateAction<{
      [key: string]: {
        online: boolean;
        socketId: string;
      };
    } | null>
  >;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userRooms, setUserRooms] = useState<{
    [key: string]: {
      online: boolean;
      socketId: string;
    };
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in
    const storedUser = sessionStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (name: string, room: string) => {
    setLoading(true);
    try {
      // In a real app, this would be an API call
      // For demo purposes, we'll simulate a successful login
      let payload: User = {
        name,
        room,
      };

      const resp = await fetch("http://localhost:3001/api/v1/auth/login", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await resp.json();

      if (data.token!) {
        payload = {
          ...payload,
          token: data.token,
        };
        setUser(payload);
        sessionStorage.setItem("user", JSON.stringify(payload));
        router.push(`/room/${payload.room}`);
      }

      //   setUser(mockUser);
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem("user");
    router.push("/login");
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, logout, userRooms, setUserRooms }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
