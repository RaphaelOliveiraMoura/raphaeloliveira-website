import * as React from "react";

import type { Meta, StoryObj } from "@storybook/react";

import { Calendar } from "@/components/ui/calendar";

const meta = {
  title: "Form/Calendar",
  component: Calendar,
  parameters: {
    docs: {
      description: {
        component:
          "Componente de calendario baseado em react-day-picker. Suporta selecao unica, multipla e por intervalo. Integravel com Popover para date pickers.",
      },
    },
  },
} satisfies Meta<typeof Calendar>;

export default meta;

type Story = StoryObj<typeof meta>;

function DefaultDemo() {
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  return (
    <Calendar
      mode="single"
      selected={date}
      onSelect={setDate}
      className="rounded-md border"
    />
  );
}

export const Default: Story = {
  render: () => <DefaultDemo />,
};

const RANGE_END = new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000);

function RangeDemo() {
  const [range, setRange] = React.useState<{
    from: Date | undefined;
    to?: Date | undefined;
  }>({
    from: new Date(),
    to: RANGE_END,
  });
  return (
    <Calendar
      mode="range"
      selected={range}
      onSelect={(r) => setRange(r ?? { from: undefined })}
      numberOfMonths={2}
      className="rounded-md border"
    />
  );
}

export const WithRange: Story = {
  name: "Selecao por Intervalo",
  render: () => <RangeDemo />,
};

function MultipleDemo() {
  const [dates, setDates] = React.useState<Date[]>([]);
  return (
    <div className="space-y-2">
      <Calendar
        mode="multiple"
        selected={dates}
        onSelect={(d) => setDates(d ?? [])}
        className="rounded-md border"
      />
      <p className="text-sm text-muted-foreground">
        {dates.length} date(s) selected
      </p>
    </div>
  );
}

export const Multiple: Story = {
  name: "Selecao Multipla",
  render: () => <MultipleDemo />,
};

function DropdownsDemo() {
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  return (
    <Calendar
      mode="single"
      selected={date}
      onSelect={setDate}
      captionLayout="dropdown"
      fromYear={2020}
      toYear={2030}
      className="rounded-md border"
    />
  );
}

export const WithDropdowns: Story = {
  name: "Com Dropdowns (Mes/Ano)",
  render: () => <DropdownsDemo />,
};
