"use client";

import type React from "react";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { initializeSocket, closeSocket } from "@/lib/socket";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/auth-provider";
import { ThemeToggle } from "@/components/theme-toggle";

export default function RoomLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, setUserRooms } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }

    if (user) {
      // Initialize socket connection
      const socket = initializeSocket(user.token!);
      socket?.on("roomUsers", (data) => {
        setUserRooms(data);
      });

      // Clean up socket connection on unmount
      return () => {
        closeSocket();
      };
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      <div className="flex-1 h-screen">
        {" "}
        {/* Add margin-left equal to sidebar width */}
        <header
          className={cn("h-16 border-b flex items-center justify-between px-6")}
        >
          <div>
            <h1>TeamCollab</h1>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium">{user.name}</span>
              <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                {user.name!.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </header>
        <main className="p-6 overflow-auto h-screen">{children}</main>
      </div>
    </div>
  );
}
