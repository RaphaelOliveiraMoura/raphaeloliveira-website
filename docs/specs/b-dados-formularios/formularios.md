# Formulários

> **Status:** `concluido`
> **Prioridade:** `alta`
> **Última atualização:** 2026-02-11

## Resumo

Sistema completo de formulários para o Core Stack, integrando react-hook-form com Zod para validação tipada, máscaras de input para documentos brasileiros, validação assíncrona, e suporte a wizards multi-step. Inclui um componente wrapper que unifica RHF + Zod e mensagens de erro internacionalizadas.

## Motivação

Formulários são centrais em praticamente qualquer aplicação (cadastros, checkout, configurações). Um template base deve oferecer padrões prontos para reduzir boilerplate e garantir consistência: validação robusta, máscaras corretas para o mercado brasileiro, UX de wizards para fluxos longos e suporte a copy/paste em campos mascarados.

## Requisitos Funcionais

- **RF01:** Integração react-hook-form + Zod via @hookform/resolvers ( zodResolver )
- **RF02:** Schemas Zod reutilizáveis para: email, telefone (BR), CPF, CNPJ, CEP, data, moeda
- **RF03:** Mensagens de erro internacionalizadas (pt-BR por padrão, extensível)
- **RF04:** Validação assíncrona (ex.: verificar email único via API)
- **RF05:** Componente wrapper `Form` que integra RHF + Zod + contexto
- **RF06:** Máscaras de input para: telefone, CPF (999.999.999-99), CNPJ, CEP (99999-999), data, moeda (R$ 1.234,56), cartão de crédito
- **RF07:** Suporte inteligente a copy/paste em inputs mascarados (desmascarar no paste e reaplicar máscara)
- **RF08:** Wizard multi-step com: indicador de progresso, validação por etapa, estado preservado entre etapas

## Requisitos Não-Funcionais

- **RNF01:** Acessibilidade - labels associados, feedback de erro acessível, focus management em wizards
- **RNF02:** Performance - evitar re-renders desnecessários com Controller/controlled inputs
- **RNF03:** Internacionalização - mensagens configuráveis via i18n
- **RNF04:** TypeScript - schemas Zod inferem tipos automaticamente para `FormData`

## Design da API / Interface

### Schema base e schemas reutilizáveis

```ts
// src/lib/validation/schemas/shared.ts
import { z } from 'zod';

export const emailSchema = z.string().email('validation.email.invalid');

// Aceita telefone fixo (10 digitos): (99) 9999-9999 e celular (11 digitos): (99) 99999-9999
export const phoneBrSchema = z.string().regex(
  /^\(\d{2}\)\s?\d{4,5}-\d{4}$/,
  'validation.phone.invalid'
);

export const cpfSchema = z.string().regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, 'validation.cpf.invalid');
export const cnpjSchema = z.string().regex(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/, 'validation.cnpj.invalid');
export const cepSchema = z.string().regex(/^\d{5}-?\d{3}$/, 'validation.cep.invalid');
export const dateSchema = z.string().regex(/^\d{2}\/\d{2}\/\d{4}$/, 'validation.date.invalid');
export const currencySchema = z.string().refine((v) => /^R\$\s?[\d.,]+$/.test(v), 'validation.currency.invalid');

// Schema composto para cadastro de usuário
export const userFormSchema = z.object({
  email: emailSchema,
  phone: phoneBrSchema.optional(),
  document: z.union([cpfSchema, cnpjSchema]),
  address: z.object({ cep: cepSchema, street: z.string().min(3) }),
  birthDate: dateSchema.optional(),
  balance: currencySchema.optional(),
});
```

### Validação assíncrona (email único)

```tsx
// Uso com async validation
const schema = z.object({
  email: z.string().email().refine(
    async (email) => {
      const { available } = await checkEmailApi(email);
      return available;
    },
    { message: 'validation.email.taken' }
  ),
});
```

### Form wrapper e uso com shadcn/ui

```tsx
// src/components/shared/form.tsx
import { useForm, FormProvider, useFormContext } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { z } from 'zod';

interface FormProps<T extends z.ZodType> {
  schema: T;
  defaultValues?: z.infer<T>;
  onSubmit: (data: z.infer<T>) => void | Promise<void>;
  children: React.ReactNode;
}

export function Form<T extends z.ZodType>({
  schema,
  defaultValues,
  onSubmit,
  children,
}: FormProps<T>) {
  const form = useForm<z.infer<T>>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {children}
      </form>
    </FormProvider>
  );
}

// Dentro de componentes filhos do Form, usar useFormContext para acessar o control:
function UserFormFields() {
  const { control } = useFormContext();

  return (
    <FormField
      control={control}
      name="email"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Email</FormLabel>
          <FormControl>
            <Input {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

// Uso:
<Form schema={userFormSchema} defaultValues={user} onSubmit={handleSave}>
  <UserFormFields />
</Form>
```

### Máscaras e copy/paste

```tsx
// src/lib/masks/index.ts
export const masks = {
  // Mascara de telefone - suporta fixo (10 digitos) e celular (11 digitos)
  phone: (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 11);
    if (digits.length <= 10) {
      // Telefone fixo: (99) 9999-9999
      return digits.replace(/(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3");
    }
    // Celular: (99) 99999-9999
    return digits.replace(/(\d{2})(\d{5})(\d{0,4})/, "($1) $2-$3");
  },
  cpf: (value: string) => value.replace(/\D/g, '').replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4'),
  cnpj: (value: string) => value.replace(/\D/g, '').replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5'),
  cep: (value: string) => value.replace(/\D/g, '').replace(/(\d{5})(\d{3})/, '$1-$2'),
  date: (value: string) => value.replace(/\D/g, '').replace(/(\d{2})(\d{2})(\d{4})/, '$1/$2/$3'),
  currency: (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(Number(numbers) / 100);
  },
  creditCard: (value: string) => value.replace(/\D/g, '').replace(/(\d{4})/g, '$1 ').trim(),
};

// Limites de digitos por tipo de mascara
const maxDigits: Record<string, number> = {
  cpf: 11,
  cnpj: 14,
  cep: 8,
  phone: 11,
  creditCard: 16,
  date: 8,
  currency: 15,
};

export function applyMask(value: string, type: keyof typeof masks): string {
  const digits = value.replace(/\D/g, "").slice(0, maxDigits[type] ?? 20);
  return masks[type](digits);
}

// src/components/shared/masked-input.tsx
// Input com mask + paste support integrado com react-hook-form via Controller
import { Controller, useFormContext } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { applyMask, type masks } from '@/lib/masks';

interface MaskedInputProps extends Omit<React.ComponentProps<typeof Input>, 'value' | 'onChange'> {
  name: string;
  mask: keyof typeof masks;
}

export function MaskedInput({ name, mask, ...props }: MaskedInputProps) {
  const { control } = useFormContext();

  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <Input
          {...props}
          value={applyMask(field.value ?? '', mask)}
          onChange={(e) => {
            const raw = e.target.value.replace(/\D/g, '');
            field.onChange(raw);
          }}
          onPaste={(e) => {
            e.preventDefault();
            const pasted = (e.clipboardData?.getData('text') ?? '').replace(/\D/g, '');
            field.onChange(pasted);
          }}
        />
      )}
    />
  );
}
```

### Wizard multi-step

```tsx
// src/components/shared/form-wizard.tsx
import { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { z } from 'zod';

interface StepConfig {
  id: string;
  title: string;
  fields: string[];
  schema: z.ZodSchema;
}

export function FormWizard({ steps, onSubmit }: { steps: StepConfig[]; onSubmit: (data: unknown) => void }) {
  const [step, setStep] = useState(0);
  const allFields = steps.flatMap((s) => s.fields);
  const form = useForm({ defaultValues: Object.fromEntries(allFields.map((f) => [f, ''])) });

  const handleNext = async () => {
    const valid = await form.trigger(steps[step].fields);
    if (valid) setStep((s) => Math.min(s + 1, steps.length - 1));
  };

  return (
    <FormProvider {...form}>
      <Progress value={((step + 1) / steps.length) * 100} />
      <form onSubmit={form.handleSubmit(onSubmit)}>
        {steps.map((s, i) => (
          <div key={s.id} hidden={i !== step}>
            {s.fields.map((fieldName) => (
              <FormField
                key={fieldName}
                control={form.control}
                name={fieldName}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{fieldName}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}
          </div>
        ))}
        <div>
          {step > 0 && <Button type="button" onClick={() => setStep((s) => s - 1)}>Voltar</Button>}
          {step < steps.length - 1 ? (
            <Button type="button" onClick={handleNext}>Próximo</Button>
          ) : (
            <Button type="submit">Enviar</Button>
          )}
        </div>
      </form>
    </FormProvider>
  );
}
```

## Estrutura de Arquivos

```
src/
├── lib/
│   ├── validation/
│   │   ├── schemas/
│   │   │   ├── shared.ts          # Schemas reutilizáveis (email, cpf, etc.)
│   │   │   └── index.ts
│   │   └── index.ts
│   └── masks/
│       ├── index.ts               # Máscaras, applyMask e unmask helpers
│       ├── phone.ts
│       ├── document.ts            # CPF, CNPJ
│       └── currency.ts
├── components/
│   └── shared/
│       ├── form.tsx               # Wrapper RHF + Zod
│       ├── form-wizard.tsx        # Wizard multi-step
│       ├── masked-input.tsx       # Input com máscara + paste (usa Controller)
│       └── index.ts
└── config/
    └── i18n/
        └── validation.ts          # Mensagens de erro traduzidas
```

> **Nota:** O caminho `config/i18n/validation.ts` segue a convenção definida na spec de [Internacionalização](../e-infraestrutura/internacionalizacao.md). As chaves de validação (ex: `validation.email.invalid`) são resolvidas pelo sistema de i18n centralizado.

## Dependências

### Bibliotecas Externas

- `react-hook-form` - gerenciamento de estado de formulário
- `@hookform/resolvers` - bridge para resolver Zod com RHF
- `zod` - schemas e validação
- `@radix-ui/react-*` - componentes base (Form* via shadcn)

### Specs Relacionados

- [Formatadores & Date/Time](./formatadores-datetime.md) - máscaras de display e datas
- [Internacionalização](../e-infraestrutura/internacionalizacao.md) - mensagens de validação
- [Componentes & Storybook](../a-fundacao-visual/componentes-storybook.md) - FormField, Input, Button
- [Feedback & Orientação](../f-padroes-ux/feedback-orientacao.md) - toast de sucesso/erro

## Critérios de Aceite

- [ ] RF01: RHF + Zod integrados via zodResolver em todos os exemplos
- [ ] RF02: Schemas shared para email, phone, CPF, CNPJ, CEP, date, currency implementados
- [ ] RF03: Mensagens de erro via chave i18n (ex: `validation.email.invalid`)
- [ ] RF04: Exemplo funcional de validação assíncrona (email único)
- [ ] RF05: Componente Form wrapper exportado e documentado
- [ ] RF06: Máscaras para todos os tipos listados (phone, CPF, CNPJ, CEP, date, currency, card)
- [ ] RF07: Paste em MaskedInput remove caracteres não numéricos e aplica máscara corretamente
- [ ] RF08: FormWizard com progresso, validação por step e preservação de estado
- [ ] Testes unitários para schemas e máscaras
- [ ] Storybook com exemplos de Form, MaskedInput e FormWizard

## Referências

- [react-hook-form](https://react-hook-form.com/)
- [Zod](https://zod.dev/)
- [@hookform/resolvers](https://github.com/react-hook-form/resolvers)
- [shadcn Form](https://ui.shadcn.com/docs/components/form)
