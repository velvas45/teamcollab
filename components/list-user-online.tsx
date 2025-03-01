"use client";

import { useAuth } from "@/providers/auth-provider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { PhoneCall } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

type OnlineUsersListProps = {
  onStartChat: (name: string, socketId: string) => void;
  isNeedVideoCall?: boolean;
};

export function OnlineUsersList({
  onStartChat,
  isNeedVideoCall,
}: OnlineUsersListProps) {
  const { userRooms } = useAuth();

  return (
    <div className="h-full flex flex-col">
      <ScrollArea className="h-60">
        <div className="p-3 space-y-2">
          {userRooms ? (
            Object.entries(userRooms).map(([name, details]) => (
              <div
                key={name}
                className="flex items-center justify-between p-2 rounded-md hover:bg-muted"
              >
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <Avatar>
                      <AvatarImage src={`https://avatar.vercel.sh/${name}`} />
                      <AvatarFallback>
                        {name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span
                      className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background ${
                        details.online ? "bg-green-500" : "bg-gray-500"
                      }`}
                    />
                  </div>
                  <div>
                    <div className="font-medium" id="username">
                      {name}
                    </div>
                    <div
                      className="text-xs text-muted-foreground"
                      id="status_user"
                    >
                      {details.online ? "Online" : "Offline"}
                    </div>
                  </div>
                </div>
                {isNeedVideoCall ? (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onStartChat(name, details.socketId)}
                    className="cursor-pointer"
                  >
                    <PhoneCall className="h-4 w-4" />
                  </Button>
                ) : (
                  <div></div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              No users found
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
