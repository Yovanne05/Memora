import type { Meta, StoryObj } from "@storybook/react";
import { Badge } from "./badge";
import { CheckCircle, AlertCircle, Info, XCircle } from "lucide-react";

const meta: Meta<typeof Badge> = {
  title: "UI/Badge",
  component: Badge,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "secondary", "destructive", "outline"],
      description: "The visual style variant of the badge",
    },
    asChild: {
      control: "boolean",
      description: "Use Radix Slot to merge props with child element",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: "Badge",
    variant: "default",
  },
};

export const Secondary: Story = {
  args: {
    children: "Secondary",
    variant: "secondary",
  },
};

export const Destructive: Story = {
  args: {
    children: "Error",
    variant: "destructive",
  },
};

export const Outline: Story = {
  args: {
    children: "Outline",
    variant: "outline",
  },
};

export const WithIcon: Story = {
  args: {
    children: (
      <>
        <CheckCircle />
        Success
      </>
    ),
    variant: "default",
  },
};

export const StatusBadges: Story = {
  render: () => (
    <div className="flex gap-2 flex-wrap">
      <Badge variant="default">
        <CheckCircle />
        Active
      </Badge>
      <Badge variant="secondary">
        <Info />
        Pending
      </Badge>
      <Badge variant="destructive">
        <XCircle />
        Failed
      </Badge>
      <Badge variant="outline">
        <AlertCircle />
        Warning
      </Badge>
    </div>
  ),
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2 flex-wrap">
        <Badge variant="default">Default</Badge>
        <Badge variant="secondary">Secondary</Badge>
        <Badge variant="destructive">Destructive</Badge>
        <Badge variant="outline">Outline</Badge>
      </div>
      <div className="flex gap-2 flex-wrap">
        <Badge variant="default">New</Badge>
        <Badge variant="secondary">Updated</Badge>
        <Badge variant="outline">Draft</Badge>
      </div>
    </div>
  ),
};
