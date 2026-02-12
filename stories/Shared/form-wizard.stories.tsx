import { useFormContext } from "react-hook-form";

import type { Meta, StoryObj } from "@storybook/react";
import { z } from "zod/v4";

import { FormWizard, type StepConfig } from "@/components/shared/form-wizard";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const personalSchema = z.object({
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
});

const contactSchema = z.object({
  email: z.email("Invalid email"),
  phone: z.string().min(8, "Phone must be at least 8 digits"),
});

const preferencesSchema = z.object({
  role: z.string().min(1, "Please select a role"),
});

const fullSchema = personalSchema.merge(contactSchema).merge(preferencesSchema);

type FormValues = z.infer<typeof fullSchema>;

const steps: StepConfig<FormValues>[] = [
  {
    id: "personal",
    title: "Personal Info",
    fields: ["firstName", "lastName"],
    schema: personalSchema,
  },
  {
    id: "contact",
    title: "Contact Details",
    fields: ["email", "phone"],
    schema: contactSchema,
  },
  {
    id: "preferences",
    title: "Preferences",
    fields: ["role"],
    schema: preferencesSchema,
  },
];

function StepContent({ step }: { step: StepConfig<FormValues> }) {
  const form = useFormContext<FormValues>();

  if (step.id === "personal") {
    return (
      <div className="space-y-4">
        <FormField
          control={form.control}
          name="firstName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>First Name</FormLabel>
              <FormControl>
                <Input placeholder="John" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="lastName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Last Name</FormLabel>
              <FormControl>
                <Input placeholder="Doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    );
  }

  if (step.id === "contact") {
    return (
      <div className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="john@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone</FormLabel>
              <FormControl>
                <Input placeholder="(11) 99999-9999" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    );
  }

  return (
    <FormField
      control={form.control}
      name="role"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Role</FormLabel>
          <Select onValueChange={field.onChange} defaultValue={field.value}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select your role" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="developer">Developer</SelectItem>
              <SelectItem value="designer">Designer</SelectItem>
              <SelectItem value="manager">Manager</SelectItem>
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

const meta = {
  title: "Shared/FormWizard",
  component: FormWizard,
  parameters: {
    docs: {
      description: {
        component:
          "Formulario multi-step com validacao por etapa, barra de progresso e animacao de transicao. Baseado em react-hook-form + Zod + Framer Motion.",
      },
    },
  },
} satisfies Meta<typeof FormWizard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className="w-full max-w-md">
      <FormWizard
        steps={steps}
        schema={fullSchema}
        defaultValues={{
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          role: "",
        }}
        onSubmit={(data) => alert(JSON.stringify(data, null, 2))}
      >
        {(step) => <StepContent step={step} />}
      </FormWizard>
    </div>
  ),
};
