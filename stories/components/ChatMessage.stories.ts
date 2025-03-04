import { ChatMessage } from "@/components/chat-message";
import type { Meta, StoryObj } from "@storybook/react";

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
const meta = {
  title: "TeamCollab/Component/ChatMessage",
  component: ChatMessage,
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
    layout: "centered",
  },
  // More on argTypes: https://storybook.js.org/docs/api/argtypes
  argTypes: {
    message: {
      name: "Rudi",
      content: "Hello Are You There",
    },
  },
  // Use `fn` to spy on the onClick arg, which will appear in the actions panel once invoked: https://storybook.js.org/docs/essentials/actions#action-args
} satisfies Meta<typeof ChatMessage>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const isOwnMessage: Story = {
  args: {
    message: {
      name: "Rudi",
      content: "Hello Are You There",
    },
    isOwnMessage: true,
  },
};

export const isNotOwnMessage: Story = {
  args: {
    message: {
      name: "Falah",
      content: "Hai, I miss you",
    },
    isOwnMessage: false,
  },
};
