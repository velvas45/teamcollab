import Home from "@/app/page";
import type { Meta, StoryObj } from "@storybook/react";

const meta = {
  title: "TeamCollab/Pages/Landing Page",
  component: Home,
  parameters: {
    // More on how to position stories at: https://storybook.js.org/docs/configure/story-layout
    layout: "fullscreen",
  },
} satisfies Meta<typeof Home>;

export default meta;
type Story = StoryObj<typeof meta>;

export const LandingPage: Story = {};
