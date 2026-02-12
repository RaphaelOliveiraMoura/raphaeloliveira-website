import * as React from "react";

import type { Meta, StoryObj } from "@storybook/react";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const meta = {
  title: "Layout/PageTransition",
  parameters: {
    docs: {
      description: {
        component:
          "Animacao de transicao de pagina enter-only. Usa motion.div com key baseado no pathname para re-montar e animar a cada navegacao. Respeita prefers-reduced-motion.",
      },
    },
  },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

function PageTransitionDemo() {
  const [page, setPage] = React.useState("home");

  const content: Record<string, { title: string; body: string }> = {
    home: { title: "Home", body: "Welcome to the homepage." },
    about: { title: "About", body: "Learn more about us." },
    contact: { title: "Contact", body: "Get in touch with us." },
  };

  const current = content[page] ?? content.home;

  return (
    <div className="w-full max-w-md space-y-4">
      <div className="flex gap-2">
        {Object.keys(content).map((key) => (
          <Button
            key={key}
            variant={page === key ? "default" : "outline"}
            size="sm"
            onClick={() => setPage(key)}
          >
            {content[key]?.title}
          </Button>
        ))}
      </div>
      <motion.div
        key={page}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
      >
        <Card>
          <CardHeader>
            <CardTitle>{current?.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{current?.body}</p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

export const Default: Story = {
  render: () => <PageTransitionDemo />,
};
