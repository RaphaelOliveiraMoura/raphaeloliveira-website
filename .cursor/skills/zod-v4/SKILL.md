---
name: zod-v4
description: |
  Zod 4 schema validation for TypeScript. Covers breaking changes from v3 (error customization, z.object changes, string format subclasses, z.record, z.function, z.enum), new APIs (z.interface, z.strictObject, z.looseObject, z.treeifyError, z.prefault), and common migration pitfalls.

  Use when writing Zod schemas, validating forms, defining API contracts, or when the user mentions Zod, schema validation, z.object, z.string, or z.infer.
---

# Zod 4

**Versions**: zod@4.3.6
**Migration guide**: https://zod.dev/v4/changelog
**Codemod**: https://github.com/nicoespeon/zod-v3-to-v4

---

## Critical Breaking Changes (highest impact)

### Error Customization - Unified `error` param

```ts
// v3 (deprecated)
z.string({ invalid_type_error: "Not a string", required_error: "Required" })
z.string().min(5, { message: "Too short" })
z.string({ errorMap: (issue) => ({ message: "Custom" }) })

// v4 (correct)
z.string({ error: (issue) => issue.input === undefined ? "Required" : "Not a string" })
z.string().min(5, { error: "Too short" })
z.string({ error: (issue) => { if (issue.code === "too_small") return `Min ${issue.minimum}` } })
```

- `message` param deprecated -> use `error`
- `invalid_type_error` / `required_error` dropped -> use `error` function
- `errorMap` renamed to `error`; can return plain `string` or `undefined`

### String Formats - Top-level subclasses

```ts
// v3 (deprecated)
z.string().email()
z.string().uuid()
z.string().url()
z.string().ip()

// v4 (correct)
z.email()
z.uuid()  // stricter RFC 9562/4122; use z.guid() for permissive
z.url()
z.ipv4()  // z.string().ip() dropped; use z.ipv4() or z.ipv6()
z.ipv6()
z.cidrv4()
z.cidrv6()

// Also available:
z.emoji()
z.base64()
z.base64url()  // no padding allowed in v4
z.nanoid()
z.cuid()
z.cuid2()
z.ulid()
z.iso.date()
z.iso.time()
z.iso.datetime()
z.iso.duration()
```

Method forms still work but are deprecated. Top-level forms are tree-shakable.

### z.object() Changes

```ts
// .strict() / .passthrough() deprecated
// v3
z.object({ name: z.string() }).strict()
z.object({ name: z.string() }).passthrough()

// v4
z.strictObject({ name: z.string() })
z.looseObject({ name: z.string() })

// .merge() deprecated -> use .extend() or spread
// v3
const Extended = Base.merge(Additional)

// v4
const Extended = Base.extend(Additional.shape)
// or (best TS perf):
const Extended = z.object({ ...Base.shape, ...Additional.shape })

// .deepPartial() dropped (no replacement, was anti-pattern)
// .nonstrict() dropped
// .strip() deprecated (was default behavior anyway)
```

**Subtle**: defaults inside optional fields now apply:
```ts
const schema = z.object({ a: z.string().default("tuna").optional() })
schema.parse({})
// v3: {}
// v4: { a: "tuna" }
```

**z.unknown() / z.any()** no longer optional in objects:
```ts
const schema = z.object({ a: z.any(), b: z.unknown() })
// v3: { a?: any; b?: unknown }
// v4: { a: any; b: unknown }
```

### z.record() - Two args required

```ts
// v3
z.record(z.string())  // worked

// v4 - requires both key and value
z.record(z.string(), z.string())  // correct

// Enum keys are now exhaustive:
z.record(z.enum(["a", "b"]), z.number())
// v3: { a?: number; b?: number }
// v4: { a: number; b: number }   <- validates all keys exist

// For optional keys, use z.partialRecord():
z.partialRecord(z.enum(["a", "b"]), z.number())
```

### z.nativeEnum() -> z.enum()

```ts
// v3
z.nativeEnum(Color)

// v4 - z.enum() now accepts TS enums directly
enum Color { Red = "red", Green = "green" }
z.enum(Color)

// Access values:
ColorSchema.enum.Red  // "Red" (canonical)
// ColorSchema.Enum.Red   // removed
// ColorSchema.Values.Red // removed
```

### z.function() - New API

```ts
// v3
const myFn = z.function()
  .args(z.string(), z.number())
  .returns(z.boolean())
  .implement((name, age) => true)

// v4 - standalone function factory
const myFn = z.function({
  input: [z.object({ name: z.string(), age: z.number() })],
  output: z.string(),
})
myFn.implement((input) => `Hello ${input.name}`)
myFn.implementAsync(async (input) => `Hello ${input.name}`)
```

### .default() - Changed behavior

```ts
// v4: default short-circuits parsing, value must match OUTPUT type
const schema = z.string().transform(val => val.length).default(0)
schema.parse(undefined) // => 0

// v3: default was parsed, value had to match INPUT type
// To replicate v3 behavior, use .prefault():
const schema = z.string().transform(val => val.length).prefault("tuna")
schema.parse(undefined) // => 4
```

### z.coerce - Input type is now `unknown`

```ts
const schema = z.coerce.string()
type Input = z.input<typeof schema>
// v3: string
// v4: unknown
```

---

## Other Breaking Changes

### z.number()
- `Infinity` / `-Infinity` no longer valid
- `.int()` rejects unsafe integers (outside `MIN_SAFE_INTEGER` / `MAX_SAFE_INTEGER`)
- `.safe()` now behaves like `.int()` (no floats)

### .refine()
- Type predicates no longer narrow types (use `.check()` or `z.transform()`)
- `ctx.path` dropped inside `.superRefine()` callbacks
- Function as second argument dropped

### ZodError
- `.format()` deprecated -> use `z.treeifyError(error)`
- `.flatten()` deprecated -> use `z.treeifyError(error)`
- `.formErrors` dropped
- `.addIssue()` / `.addIssues()` deprecated -> push to `err.issues` directly

### Miscellaneous
- `z.promise()` deprecated (just `await` before parsing)
- `z.ostring()`, `z.onumber()` etc. dropped
- `z.literal()` no longer accepts symbols
- `z.ZodTypeAny` -> just use `z.ZodType`
- `._def` moved to `._zod.def`

---

## New Features

### z.interface() - Recursive types

```ts
// For recursive/self-referencing schemas
const Category = z.interface({
  name: z.string(),
  children: z.array(z.lazy(() => Category)),
})
```

### z.treeifyError() - Error formatting

```ts
const result = schema.safeParse(data)
if (!result.success) {
  const tree = z.treeifyError(result.error)
  // tree.errors -> top-level errors
  // tree.properties.fieldName.errors -> field errors
}
```

### Zod Mini - Lighter alternative

```ts
import * as z from "zod/mini"

z.string().check(
  z.minLength(10),
  z.maxLength(100),
  z.toLowerCase(),
  z.trim(),
)
```

### z.core namespace

```ts
import * as z from "zod"
// Utility types available via z.core:
type Issue = z.core.$ZodIssueInvalidType
type Error = z.core.$ZodError
```

---

## Integration with React Hook Form

When using `@hookform/resolvers@5.2.2+` with Zod 4:

```ts
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

const schema = z.object({
  name: z.string().min(1, { error: "Required" }),
  email: z.email({ error: "Invalid email" }),
})

// Let useForm infer types from resolver (do NOT pass explicit generic)
const form = useForm({
  resolver: zodResolver(schema),
})

// For schemas with transforms, use z.input for form field types:
type FormInput = z.input<typeof schema>
// Use z.infer (alias for z.output) for the parsed/transformed output
type FormOutput = z.infer<typeof schema>
```

**Known issues** (ver `react-hook-form-zod` skill para mais detalhes):
- Do NOT pass explicit generics to `useForm<T>()` with Zod v4 transforms
- Use `z.input<>` (not `z.infer<>`) for form field types when using coerce/default/transform

---

## Quick Migration Checklist

- [ ] `npm install zod@^4.0.0`
- [ ] Replace `message` with `error` in schema options
- [ ] Replace `invalid_type_error` / `required_error` with `error` function
- [ ] Replace `errorMap` with `error`
- [ ] Move string validations to top-level: `z.email()`, `z.uuid()`, etc.
- [ ] Replace `z.nativeEnum()` with `z.enum()`
- [ ] Replace `.strict()` with `z.strictObject()`
- [ ] Replace `.merge()` with `.extend()` or spread
- [ ] Add second arg to `z.record()` calls
- [ ] Replace `.format()` / `.flatten()` with `z.treeifyError()`
- [ ] Update `z.function()` to new API if used
- [ ] Check `.default()` values match OUTPUT type (or use `.prefault()`)
- [ ] Run codemod: `npx zod-v3-to-v4`

**Official docs**: https://zod.dev | **Migration**: https://zod.dev/v4/changelog
