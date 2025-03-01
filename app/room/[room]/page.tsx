"use client";

import type React from "react";

import { useState, useEffect, useRef } from "react";
import { getSocket } from "@/lib/socket";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send } from "lucide-react";
import { useAuth } from "@/providers/auth-provider";
import { ChatMessage } from "@/components/chat-message";
import { cn } from "@/lib/utils";
import VideoCallPage from "@/components/video-call";
import { OnlineUsersList } from "@/components/list-user-online";

type Message = {
  name: string;
  content: string;
};

export default function ChatPage() {
  const { user } = useAuth();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socket = getSocket();

  // Mock data for demonstration
  useEffect(() => {
    // Set up socket event listeners
    socket?.on("message", (newMessage: Message) => {
      setMessages((prev) => [...prev, newMessage]);
    });

    return () => {
      socket?.off("message");
    };
  }, [user, socket]);

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]); //Corrected dependency

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();

    if (!message.trim()) return;

    const newMessage: Message = {
      content: message,
      name: user?.name as string,
    };

    setMessages((prev) => [...prev, newMessage]);

    // In a real app, this would emit to the socket server
    socket?.emit("message", newMessage);

    setMessage("");
  };

  return (
    <div className="h-full flex flex-col">
      <Tabs defaultValue="chats" className="flex flex-col h-full">
        <div className="flex items-center justify-between mb-4">
          <TabsList>
            <TabsTrigger className="cursor-pointer" value="chats">
              Chats
            </TabsTrigger>
            <TabsTrigger className="cursor-pointer" value="video">
              Video
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="flex flex-1 overflow-hidden">
          <TabsContent value="chats" className="flex-1 h-full flex">
            <div className="w-64 border-r h-full overflow-hidden flex flex-col">
              <OnlineUsersList />
            </div>

            <div className="flex-1 flex flex-col h-full overflow-hidden">
              <>
                <div className="p-3 border-b flex items-center space-x-3 justify-end">
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={`https://avatar.vercel.sh/${user!.name}`}
                    />
                    <AvatarFallback>
                      {user!.name!.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{user!.name}</div>
                    <div className="text-xs text-muted-foreground">Online</div>
                  </div>
                </div>

                <ScrollArea
                  className={cn("p-4", messages.length > 0 ? "h-48" : "h-max")}
                >
                  <div className="space-y-4">
                    {messages.length > 0 ? (
                      messages.map((msg, idx) => (
                        <ChatMessage
                          key={idx}
                          message={msg}
                          isOwnMessage={msg.name === user?.name}
                        />
                      ))
                    ) : (
                      <p className="text-sm m-0">No Message Right Now.</p>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                <div className="p-3 border-t">
                  <form
                    onSubmit={handleSendMessage}
                    className="flex space-x-2 items-center"
                  >
                    <Input
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Type your message..."
                      className="flex-1"
                    />
                    <Button
                      type="submit"
                      size="icon"
                      className="mt-0 cursor-pointer"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </form>
                </div>
              </>
              {/* {activeChat ? (
                <>
                  <div className="p-3 border-b flex items-center space-x-3">
                    {activeChat.isGroup ? (
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <Users className="h-4 w-4 text-primary" />
                      </div>
                    ) : (
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={`https://avatar.vercel.sh/${activeChat.name}`}
                        />
                        <AvatarFallback>
                          {activeChat.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div>
                      <div className="font-medium">{activeChat.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {activeChat.isGroup
                          ? `${activeChat.participants.length} members`
                          : "Online"}
                      </div>
                    </div>
                  </div>

                  <ScrollArea className="flex-1 p-4">
                    <div className="space-y-4">
                      {messages.map((msg) => (
                        <ChatMessage
                          key={msg.id}
                          message={msg}
                          isOwnMessage={msg.senderId === user?.id}
                        />
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                  </ScrollArea>

                  <div className="p-3 border-t">
                    <form
                      onSubmit={handleSendMessage}
                      className="flex space-x-2"
                    >
                      <Input
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Type your message..."
                        className="flex-1"
                      />
                      <Button type="submit" size="icon">
                        <Send className="h-4 w-4" />
                      </Button>
                    </form>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <h3 className="text-lg font-medium">No chat selected</h3>
                    <p className="text-muted-foreground">
                      Select a chat from the sidebar or create a new one
                    </p>
                  </div>
                </div>
              )} */}
            </div>
          </TabsContent>
          <TabsContent value="video" className="flex-1 h-full flex">
            <div className="flex-1 flex flex-col">
              <>
                <VideoCallPage />
              </>
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
