"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type Message = {
  name: string;
  content: string;
};

type ChatMessageProps = {
  message: Message;
  isOwnMessage: boolean;
};

export function ChatMessage({ message, isOwnMessage }: ChatMessageProps) {
  return (
    <div
      className={`flex items-start gap-2 ${
        isOwnMessage ? "flex-row-reverse" : ""
      }`}
    >
      {!isOwnMessage && (
        <Avatar className="h-8 w-8">
          <AvatarImage src={`https://avatar.vercel.sh/${message.name}`} />
          <AvatarFallback>
            {message.name.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      )}
      <div
        className={`flex flex-col ${
          isOwnMessage ? "items-end" : "items-start"
        }`}
      >
        {!isOwnMessage && (
          <span className="text-xs font-medium">{message.name}</span>
        )}
        <div
          className={`rounded-lg px-3 py-2 max-w-xs mt-1 ${
            isOwnMessage
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-foreground"
          }`}
        >
          {message.content}
        </div>
      </div>
    </div>
  );
}
