---
name: react-hook-form-zod
description: |
  React Hook Form v7 integrated with Zod v4 via @hookform/resolvers v5. Covers zodResolver setup, type inference pitfalls with Zod v4 transforms, FormProvider patterns, nested forms, field arrays, and common type errors.

  Use when building forms with react-hook-form and zod, using zodResolver, handling form validation, or debugging type errors between useForm and zod schemas.
---

# React Hook Form + Zod v4

**Versions**: react-hook-form@7.71.1, @hookform/resolvers@5.2.2, zod@4.3.6
**Docs**: https://react-hook-form.com | https://zod.dev

---

## Quick Setup

```tsx
"use client";

import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const schema = z.object({
  name: z.string().min(1, { error: "Required" }),
  email: z.email({ error: "Invalid email" }),
  age: z.number().int().min(18, { error: "Must be 18+" }),
});

// Let useForm INFER types from the resolver (do NOT pass explicit generic)
const form = useForm({
  resolver: zodResolver(schema),
  defaultValues: {
    name: "",
    email: "",
    age: 18,
  },
});
```

---

## Critical Rules

### Always Do

**Let useForm infer types from resolver** (do NOT pass explicit generics):
```tsx
// CORRECT - types inferred from schema
const form = useForm({
  resolver: zodResolver(schema),
});

// WRONG - explicit generic causes type conflicts with Zod v4 transforms
const form = useForm<z.infer<typeof schema>>({
  resolver: zodResolver(schema),
});
```

**Use `z.input<>` for form field types** (not `z.infer<>`) when using transforms:
```tsx
// z.input = pre-transform type (what the form fields produce)
// z.infer = post-transform type (what onSubmit receives)
type FormFields = z.input<typeof schema>;   // for typing form inputs
type FormOutput = z.infer<typeof schema>;   // for typing onSubmit data
```

**Use Zod v4 error syntax** (not v3 `message`):
```tsx
// v3 (deprecated)
z.string().min(1, { message: "Required" })

// v4 (correct)
z.string().min(1, { error: "Required" })
```

**Use `$ZodType` from `zod/v4/core` for generic schema typing**:
```tsx
import type { $ZodType } from "zod/v4/core";

interface FormProps<TValues extends FieldValues> {
  schema: $ZodType<TValues, TValues>;
}
```

**Always provide `defaultValues`** to avoid uncontrolled-to-controlled warnings:
```tsx
const form = useForm({
  resolver: zodResolver(schema),
  defaultValues: {
    name: "",       // string fields -> ""
    age: undefined, // optional number fields -> undefined
    agree: false,   // boolean fields -> false
  },
});
```

### Never Do

**Never pass explicit generics to `useForm<T>()`** with Zod v4:
```tsx
// WRONG - causes type mismatch with coerce/default/transform
const form = useForm<FormData>({ resolver: zodResolver(schema) });
```

**Never use `z.infer<>` for default values typing** when schema has transforms:
```tsx
// WRONG - z.infer gives OUTPUT type, defaultValues need INPUT type
const defaults: z.infer<typeof schema> = { ... }

// CORRECT
const defaults: z.input<typeof schema> = { ... }
```

---

## Project Pattern: Form Component

The Core Stack provides a `Form` component in `@/components/shared/form`:

```tsx
import { Form } from "@/components/shared";

<Form
  schema={loginSchema}
  defaultValues={{ email: "", password: "" }}
  onSubmit={handleLogin}
>
  {/* form fields */}
</Form>
```

This wraps `useForm` + `FormProvider` + `zodResolver`. Use it for standard forms. Use raw `useForm` only for advanced cases (FormWizard, dynamic fields, etc.).

## shadcn/ui Form Fields

Use shadcn/ui `<FormField>` with `useFormContext`:

```tsx
import { useFormContext } from "react-hook-form";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

function NameField() {
  const form = useFormContext();

  return (
    <FormField
      control={form.control}
      name="name"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Name</FormLabel>
          <FormControl>
            <Input {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
```

---

## Common Patterns

### Form with Transforms (coerce)

```tsx
const schema = z.object({
  quantity: z.coerce.number().int().min(1),
  price: z.coerce.number().min(0),
});

// z.input<typeof schema> = { quantity: unknown; price: unknown }
// z.infer<typeof schema> = { quantity: number; price: number }

const form = useForm({
  resolver: zodResolver(schema),
  defaultValues: { quantity: 1, price: 0 },
});
```

### Optional Fields with Defaults

```tsx
const schema = z.object({
  name: z.string().min(1, { error: "Required" }),
  bio: z.string().optional(),  // string | undefined
  role: z.enum(["admin", "user"]).default("user"),
});

// Zod v4: .default() short-circuits, value must match OUTPUT type
// bio is undefined if not provided, role is "user" if not provided
```

### Nested Objects

```tsx
const addressSchema = z.object({
  street: z.string().min(1, { error: "Required" }),
  city: z.string().min(1, { error: "Required" }),
  zip: z.string().min(5, { error: "Min 5 chars" }),
});

const schema = z.object({
  name: z.string().min(1, { error: "Required" }),
  address: addressSchema,
});

// Access nested fields:
<FormField control={form.control} name="address.street" ... />
<FormField control={form.control} name="address.city" ... />
```

### Field Arrays (useFieldArray)

```tsx
import { useFieldArray } from "react-hook-form";

const schema = z.object({
  items: z.array(z.object({
    name: z.string().min(1, { error: "Required" }),
    quantity: z.coerce.number().int().min(1),
  })).min(1, { error: "At least one item" }),
});

function ItemsForm() {
  const form = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  return (
    <>
      {fields.map((field, index) => (
        <div key={field.id}>
          <FormField name={`items.${index}.name`} ... />
          <FormField name={`items.${index}.quantity`} ... />
          <button onClick={() => remove(index)}>Remove</button>
        </div>
      ))}
      <button onClick={() => append({ name: "", quantity: 1 })}>Add</button>
    </>
  );
}
```

### Multi-Step Form (FormWizard)

For multi-step forms, the project provides `FormWizard` in `@/components/shared/form-wizard`. Each step has its own schema, and data is merged across steps.

---

## Known Issues (Zod v4 + RHF)

### Issue #1: Type error with explicit useForm generic
**Error**: Type mismatch when passing `useForm<z.infer<typeof schema>>()`
**Cause**: Zod v4 changed input/output typing for transforms (coerce, default, preprocess)
**Fix**: Remove explicit generic, let resolver infer types

### Issue #2: zodResolver disagrees with z.infer for transform APIs
**Error**: Optional fields showing as required in TS types
**Cause**: `z.infer` returns OUTPUT type; `z.input` returns INPUT type; they differ with transforms
**Fix**: Use `z.input<>` for form field types, `z.infer<>` for onSubmit data

### Issue #3: z.coerce + useForm generic incompatibility
**Error**: Type error when using `z.coerce.number()` with typed useForm
**Cause**: `z.coerce` input type is `unknown` in Zod v4 (was `number` in v3)
**Fix**: Remove explicit generic from useForm; let zodResolver handle typing

**Resolver version**: ensure `@hookform/resolvers >= 5.2.2` (includes Zod v4 output-type fix)

---

**React Hook Form docs**: https://react-hook-form.com
**Zod v4 migration**: https://zod.dev/v4/changelog (ver skill `zod-v4`)
