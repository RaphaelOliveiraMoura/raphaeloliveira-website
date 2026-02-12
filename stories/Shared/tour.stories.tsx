import * as React from "react";

import type { Meta, StoryObj } from "@storybook/react";

import { resetTour, Tour, type TourConfig } from "@/components/shared/tour";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const meta = {
  title: "Shared/Tour",
  component: Tour,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Componente de tour guiado baseado em driver.js. Destaca elementos da pagina em sequencia com tooltips explicativos. Suporta 'show once' via localStorage e reset programatico.",
      },
    },
  },
} satisfies Meta<typeof Tour>;

export default meta;

type Story = StoryObj<typeof meta>;

const TOUR_CONFIG: TourConfig = {
  id: "storybook-demo-tour",
  steps: [
    {
      target: "#tour-header",
      title: "Welcome!",
      content: "This is the header of your dashboard.",
      placement: "bottom",
    },
    {
      target: "#tour-stats",
      title: "Statistics",
      content: "Here you can see your key metrics at a glance.",
      placement: "bottom",
    },
    {
      target: "#tour-actions",
      title: "Actions",
      content: "Use these buttons to perform common actions.",
      placement: "top",
    },
  ],
};

function TourDemo() {
  const [running, setRunning] = React.useState(false);
  const [key, setKey] = React.useState(0);

  const startTour = () => {
    resetTour(TOUR_CONFIG.id);
    setRunning(true);
    setKey((k) => k + 1);
  };

  return (
    <div className="space-y-6">
      <div id="tour-header" className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Dashboard</h2>
        <Button variant="outline" size="sm" onClick={startTour}>
          Start Tour
        </Button>
      </div>

      <div id="tour-stats" className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">1,234</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">$12.4k</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">567</p>
          </CardContent>
        </Card>
      </div>

      <div id="tour-actions" className="flex gap-2">
        <Button size="sm">Create Report</Button>
        <Button size="sm" variant="outline">
          Export Data
        </Button>
      </div>

      {running && (
        <Tour key={key} config={TOUR_CONFIG} autoStart showOnce={false} />
      )}
    </div>
  );
}

export const Default: Story = {
  render: () => <TourDemo />,
};
