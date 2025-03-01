import { render, screen } from "@testing-library/react";
import { ChatMessage } from "@/components/chat-message";
import { describe, it, expect } from "vitest";

describe("ChatMessage", () => {
  const mockMessage = {
    name: "John Doe",
    content: "Hello, world!",
  };

  it("renders own message correctly", () => {
    render(<ChatMessage message={mockMessage} isOwnMessage={true} />);
    expect(screen.getByText("Hello, world!")).toBeInTheDocument();
  });

  it("renders other user message correctly", () => {
    render(<ChatMessage message={mockMessage} isOwnMessage={false} />);
    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("Hello, world!")).toBeInTheDocument();
  });
});
