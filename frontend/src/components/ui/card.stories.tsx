import type { Meta, StoryObj } from "@storybook/react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  CardAction,
} from "./card";
import { Button } from "./button";
import { Badge } from "./badge";
import { MoreHorizontal, Bell } from "lucide-react";

const meta: Meta<typeof Card> = {
  title: "UI/Card",
  component: Card,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Card className="w-96">
      <CardHeader>
        <CardTitle>Card Title</CardTitle>
        <CardDescription>Card description goes here</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Card content area with any elements you need.</p>
      </CardContent>
      <CardFooter>
        <Button variant="outline">Cancel</Button>
        <Button>Continue</Button>
      </CardFooter>
    </Card>
  ),
};

export const WithAction: Story = {
  render: () => (
    <Card className="w-96">
      <CardHeader>
        <CardTitle>Notifications</CardTitle>
        <CardDescription>You have 3 unread messages</CardDescription>
        <CardAction>
          <Button variant="ghost" size="icon-sm">
            <MoreHorizontal />
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Bell className="size-4" />
            <p className="text-sm">New message received</p>
          </div>
          <div className="flex items-center gap-2">
            <Bell className="size-4" />
            <p className="text-sm">Your profile was updated</p>
          </div>
        </div>
      </CardContent>
    </Card>
  ),
};

export const WithBadge: Story = {
  render: () => (
    <Card className="w-96">
      <CardHeader>
        <div className="flex items-center gap-2">
          <CardTitle>Project Status</CardTitle>
          <Badge variant="default">Active</Badge>
        </div>
        <CardDescription>Track your project progress</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium">Completion</p>
            <p className="text-2xl font-bold">75%</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">
              3 tasks remaining
            </p>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full">View Details</Button>
      </CardFooter>
    </Card>
  ),
};

export const Simple: Story = {
  render: () => (
    <Card className="w-96">
      <CardContent>
        <p>A simple card with just content, no header or footer.</p>
      </CardContent>
    </Card>
  ),
};

export const ContentOnly: Story = {
  render: () => (
    <Card className="w-96">
      <CardHeader>
        <CardTitle>Welcome Back</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Continue where you left off. Your last session was saved automatically.
        </p>
      </CardContent>
    </Card>
  ),
};

export const MultipleCards: Story = {
  render: () => (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle>Total Users</CardTitle>
          <CardDescription>Active users this month</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">2,543</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Revenue</CardTitle>
          <CardDescription>Total revenue this month</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">$45,231</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Growth</CardTitle>
          <CardDescription>Compared to last month</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-green-600">+12.5%</p>
        </CardContent>
      </Card>
    </div>
  ),
};
