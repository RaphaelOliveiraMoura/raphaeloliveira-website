import { useFormContext } from "react-hook-form";

import type { Meta, StoryObj } from "@storybook/react";
import { z } from "zod/v4";

import { Form } from "@/components/shared/form";
import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const meta = {
  title: "Shared/Form",
  component: Form,
  parameters: {
    docs: {
      description: {
        component:
          "Form wrapper com integracao Zod + react-hook-form. Configura zodResolver automaticamente a partir do schema. Wrapper de conveniencia sobre FormProvider.",
      },
    },
  },
} satisfies Meta<typeof Form>;

export default meta;

type Story = StoryObj<typeof meta>;

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.email("Invalid email address"),
});

type ContactFormValues = z.infer<typeof contactSchema>;

function ContactFormFields() {
  const form = useFormContext<ContactFormValues>();
  return (
    <>
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Name</FormLabel>
            <FormControl>
              <Input placeholder="John Doe" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
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
      <Button type="submit">Submit</Button>
    </>
  );
}

export const Default: Story = {
  render: () => (
    <Form
      schema={contactSchema}
      defaultValues={{ name: "", email: "" }}
      onSubmit={(data) => alert(JSON.stringify(data, null, 2))}
      className="w-full max-w-sm space-y-4"
    >
      <ContactFormFields />
    </Form>
  ),
};
