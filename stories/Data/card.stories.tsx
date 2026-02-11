import type { Meta, StoryObj } from "@storybook/react";
import { Bell, MoreHorizontal } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const meta = {
  title: "Data/Card",
  component: Card,
  parameters: {
    docs: {
      description: {
        component:
          "Container de card com header, content, footer e action slot. Base para dashboards, listagens e formularios.",
      },
    },
  },
} satisfies Meta<typeof Card>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Card Title</CardTitle>
        <CardDescription>Card Description</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Card content goes here. This is a flexible container for any content.
        </p>
      </CardContent>
      <CardFooter>
        <Button className="w-full">Action</Button>
      </CardFooter>
    </Card>
  ),
};

export const WithAction: Story = {
  name: "Com Action",
  render: () => (
    <Card className="w-[400px]">
      <CardHeader>
        <CardTitle>Notifications</CardTitle>
        <CardDescription>You have 3 unread messages.</CardDescription>
        <CardAction>
          <Button variant="ghost" size="icon-sm">
            <MoreHorizontal />
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-start gap-4">
          <Bell className="mt-0.5 h-5 w-5 text-muted-foreground" />
          <div className="space-y-1">
            <p className="text-sm font-medium">Push Notifications</p>
            <p className="text-sm text-muted-foreground">
              Send notifications to device.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  ),
};

export const FormCard: Story = {
  name: "Card de Formulario",
  render: () => (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Create project</CardTitle>
        <CardDescription>Deploy your new project in one-click.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid w-full items-center gap-4">
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="name">Name</Label>
            <Input id="name" placeholder="Name of your project" />
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline">Cancel</Button>
        <Button>Deploy</Button>
      </CardFooter>
    </Card>
  ),
};

export const StatsCards: Story = {
  name: "Cards de Estatisticas",
  render: () => (
    <div className="grid grid-cols-3 gap-4">
      <Card>
        <CardHeader>
          <CardDescription>Total Revenue</CardDescription>
          <CardTitle className="text-2xl">$45,231.89</CardTitle>
        </CardHeader>
        <CardContent>
          <Badge variant="secondary">+20.1% from last month</Badge>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardDescription>Active Users</CardDescription>
          <CardTitle className="text-2xl">+2,350</CardTitle>
        </CardHeader>
        <CardContent>
          <Badge variant="secondary">+180.1% from last month</Badge>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardDescription>Sales</CardDescription>
          <CardTitle className="text-2xl">+12,234</CardTitle>
        </CardHeader>
        <CardContent>
          <Badge variant="secondary">+19% from last month</Badge>
        </CardContent>
      </Card>
    </div>
  ),
};
