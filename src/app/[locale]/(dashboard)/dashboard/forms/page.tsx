"use client";

import { useState } from "react";
import { useFormContext } from "react-hook-form";

import { z } from "zod";

import { Can, PermissionButton } from "@/components/auth";
import { Breadcrumbs } from "@/components/navigation";
import {
  FileUpload,
  Form,
  FormWizard,
  LoadingButton,
  MaskedInput,
  type StepConfig,
} from "@/components/shared";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

import { toast } from "@/lib/feedback";
import { useTranslations } from "@/lib/i18n";
import {
  cepSchema,
  cpfSchema,
  emailSchema,
  formatValidationSummary,
  phoneBrSchema,
  translateFieldErrors,
  zodToFieldErrors,
  zodToFieldMap,
} from "@/lib/validation";

const contactFormSchema = z.object({
  fullName: z.string().min(3, "Min 3 characters"),
  email: emailSchema,
  phone: phoneBrSchema,
  bio: z.string().max(200).optional(),
  role: z.enum(["admin", "editor", "viewer"]),
  notifications: z.boolean(),
  experience: z.number().min(0).max(100),
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

const maskedFormSchema = z.object({
  cpf: cpfSchema,
  cep: cepSchema,
  phone: phoneBrSchema,
});

type MaskedFormValues = z.infer<typeof maskedFormSchema>;

function ContactFormFields() {
  const t = useTranslations("examples");
  const { control } = useFormContext<ContactFormValues>();

  return (
    <>
      <FormField
        control={control}
        name="fullName"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("forms.fullName")}</FormLabel>
            <FormControl>
              <Input {...field} placeholder="John Doe" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="email"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("forms.email")}</FormLabel>
            <FormControl>
              <Input {...field} type="email" placeholder="john@example.com" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="phone"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("forms.phone")}</FormLabel>
            <FormControl>
              <Input {...field} placeholder="(11) 99999-9999" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="bio"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("forms.bio")}</FormLabel>
            <FormControl>
              <Textarea {...field} rows={3} />
            </FormControl>
            <FormDescription>Max 200 characters</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="role"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("forms.role")}</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder={t("forms.selectRole")} />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="admin">{t("forms.admin")}</SelectItem>
                <SelectItem value="editor">{t("forms.editor")}</SelectItem>
                <SelectItem value="viewer">{t("forms.viewer")}</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="notifications"
        render={({ field }) => (
          <FormItem className="flex items-center gap-3">
            <FormControl>
              <Switch checked={field.value} onCheckedChange={field.onChange} />
            </FormControl>
            <FormLabel className="!mt-0">{t("forms.notifications")}</FormLabel>
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="experience"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              {t("forms.experience")}: {field.value}%
            </FormLabel>
            <FormControl>
              <Slider
                min={0}
                max={100}
                defaultValue={[field.value]}
                onValueChange={(v) => field.onChange(v[0])}
              />
            </FormControl>
          </FormItem>
        )}
      />

      <LoadingButton type="submit">{t("forms.submit")}</LoadingButton>
    </>
  );
}

function MaskedFormFields() {
  const t = useTranslations("examples");

  return (
    <>
      <div className="space-y-2">
        <Label>{t("forms.cpf")}</Label>
        <MaskedInput name="cpf" mask="cpf" placeholder="000.000.000-00" />
      </div>
      <div className="space-y-2">
        <Label>{t("forms.cep")}</Label>
        <MaskedInput name="cep" mask="cep" placeholder="00000-000" />
      </div>
      <div className="space-y-2">
        <Label>{t("forms.phone")}</Label>
        <MaskedInput name="phone" mask="phone" placeholder="(00) 00000-0000" />
      </div>
      <LoadingButton type="submit">{t("forms.submit")}</LoadingButton>
    </>
  );
}

const wizardSchema = z.object({
  name: z.string().min(2, "Min 2 characters"),
  email: emailSchema,
  street: z.string().min(3, "Min 3 characters"),
  city: z.string().min(2, "Min 2 characters"),
  state: z.string().min(2, "Min 2 characters"),
  agree: z.literal(true, { error: "You must agree to continue" }),
});

type WizardValues = z.infer<typeof wizardSchema>;

const WIZARD_STEPS: StepConfig<WizardValues>[] = [
  {
    id: "personal",
    title: "Personal Info",
    fields: ["name", "email"],
    schema: z.object({
      name: z.string().min(2),
      email: emailSchema,
    }),
  },
  {
    id: "address",
    title: "Address",
    fields: ["street", "city", "state"],
    schema: z.object({
      street: z.string().min(3),
      city: z.string().min(2),
      state: z.string().min(2),
    }),
  },
  {
    id: "confirm",
    title: "Confirmation",
    fields: ["agree"],
    schema: z.object({
      agree: z.literal(true),
    }),
  },
];

function WizardStepFields({ stepIndex }: { stepIndex: number }) {
  const t = useTranslations("examples");
  const { control, getValues } = useFormContext<WizardValues>();

  if (stepIndex === 0) {
    return (
      <>
        <FormField
          control={control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("forms.fullName")}</FormLabel>
              <FormControl>
                <Input {...field} placeholder="John Doe" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("forms.email")}</FormLabel>
              <FormControl>
                <Input {...field} type="email" placeholder="john@example.com" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </>
    );
  }

  if (stepIndex === 1) {
    return (
      <>
        <FormField
          control={control}
          name="street"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("forms.wizardStreet")}</FormLabel>
              <FormControl>
                <Input {...field} placeholder="123 Main St" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="city"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("forms.wizardCity")}</FormLabel>
              <FormControl>
                <Input {...field} placeholder="New York" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="state"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("forms.wizardState")}</FormLabel>
              <FormControl>
                <Input {...field} placeholder="NY" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </>
    );
  }

  // Step 3: Confirmation
  const values = getValues();
  return (
    <div className="space-y-3">
      <div className="rounded-md border p-4 text-sm">
        <div className="grid grid-cols-2 gap-2">
          <span className="text-muted-foreground">{t("forms.fullName")}:</span>
          <span>{values.name || "—"}</span>
          <span className="text-muted-foreground">{t("forms.email")}:</span>
          <span>{values.email || "—"}</span>
          <span className="text-muted-foreground">
            {t("forms.wizardStreet")}:
          </span>
          <span>{values.street || "—"}</span>
          <span className="text-muted-foreground">
            {t("forms.wizardCity")}:
          </span>
          <span>{values.city || "—"}</span>
          <span className="text-muted-foreground">
            {t("forms.wizardState")}:
          </span>
          <span>{values.state || "—"}</span>
        </div>
      </div>
      <p className="text-sm text-muted-foreground">
        {t("forms.wizardConfirm")}
      </p>
      <FormField
        control={control}
        name="agree"
        render={({ field }) => (
          <FormItem className="flex items-center gap-3">
            <FormControl>
              <Switch
                checked={field.value === true}
                onCheckedChange={field.onChange}
              />
            </FormControl>
            <FormLabel className="!mt-0">{t("forms.wizardAgree")}</FormLabel>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}

export default function FormsPage() {
  const t = useTranslations("examples");
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  const handleContactSubmit = (data: ContactFormValues) => {
    toast.success(t("forms.submitted"));
    // eslint-disable-next-line no-console -- Demo page: showing form data in console for development
    console.log("Contact form:", data);
  };

  const handleMaskedSubmit = (data: MaskedFormValues) => {
    toast.success(t("forms.submitted"));
    // eslint-disable-next-line no-console -- Demo page: showing form data in console for development
    console.log("Masked form:", data);
  };

  const handleFileUpload = (files: File[]) => {
    setUploadedFiles(files);
    toast.success(`${files.length} file(s) uploaded`);
  };

  return (
    <div className="space-y-6">
      <Breadcrumbs />

      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          {t("forms.title")}
        </h1>
        <p className="text-muted-foreground">{t("forms.subtitle")}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Contact Form with Zod Validation */}
        <Card>
          <CardHeader>
            <CardTitle>{t("forms.validation")}</CardTitle>
            <CardDescription>{t("forms.validationDesc")}</CardDescription>
          </CardHeader>
          <CardContent>
            <Form
              schema={contactFormSchema}
              defaultValues={{
                fullName: "",
                email: "",
                phone: "",
                bio: "",
                role: "viewer",
                notifications: false,
                experience: 50,
              }}
              onSubmit={handleContactSubmit}
            >
              <ContactFormFields />
            </Form>
          </CardContent>
        </Card>

        {/* Masked Inputs */}
        <Card>
          <CardHeader>
            <CardTitle>{t("forms.masks")}</CardTitle>
            <CardDescription>{t("forms.masksDesc")}</CardDescription>
          </CardHeader>
          <CardContent>
            <Form
              schema={maskedFormSchema}
              defaultValues={{
                cpf: "",
                cep: "",
                phone: "",
              }}
              onSubmit={handleMaskedSubmit}
            >
              <MaskedFormFields />
            </Form>
          </CardContent>
        </Card>

        {/* File Upload */}
        <Card>
          <CardHeader>
            <CardTitle>{t("forms.upload")}</CardTitle>
            <CardDescription>{t("forms.uploadDesc")}</CardDescription>
          </CardHeader>
          <CardContent>
            <FileUpload
              onUpload={handleFileUpload}
              maxSize={5 * 1024 * 1024}
              maxFiles={3}
            />
            {uploadedFiles.length > 0 && (
              <div className="mt-4">
                <Badge variant="secondary">
                  {uploadedFiles.length} file(s)
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Permissions */}
        <Card>
          <CardHeader>
            <CardTitle>{t("forms.permissions")}</CardTitle>
            <CardDescription>{t("forms.permissionsDesc")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <Can permission="users:delete">
                <div className="rounded-md border border-dashed p-4">
                  <Badge variant="default" className="mb-2">
                    admin
                  </Badge>
                  <p className="text-sm text-muted-foreground">
                    {t("forms.adminOnly")}
                  </p>
                </div>
              </Can>

              <div className="flex flex-col gap-3">
                <PermissionButton
                  permission="users:delete"
                  deniedTooltip={t("forms.adminOnly")}
                >
                  {t("forms.admin")} Action
                </PermissionButton>

                <PermissionButton permission="posts:create" variant="outline">
                  {t("forms.editor")} Action
                </PermissionButton>

                <PermissionButton permission="posts:read" variant="secondary">
                  {t("forms.viewer")} Action
                </PermissionButton>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Form Wizard */}
      <Card>
        <CardHeader>
          <CardTitle>{t("forms.wizard")}</CardTitle>
          <CardDescription>{t("forms.wizardDesc")}</CardDescription>
        </CardHeader>
        <CardContent>
          <FormWizard<WizardValues>
            steps={WIZARD_STEPS}
            schema={wizardSchema}
            defaultValues={{
              name: "",
              email: "",
              street: "",
              city: "",
              state: "",
              agree: false as unknown as true,
            }}
            onSubmit={() => {
              toast.success(t("forms.wizardSuccess"));
            }}
            submitLabel={t("forms.submit")}
          >
            {(_step, index) => <WizardStepFields stepIndex={index} />}
          </FormWizard>
        </CardContent>
      </Card>

      <Separator />

      {/* Validation Error Utilities */}
      <ValidationErrorsDemo />
    </div>
  );
}

/* ===========================
   Validation Errors Demo
   =========================== */

const demoSchema = z.object({
  name: z.string().min(3, "validation.name.min"),
  email: z.email("validation.email.invalid"),
  age: z.number().min(18, "validation.age.min"),
});

function ValidationErrorsDemo() {
  const t = useTranslations("examples");
  const [result, setResult] = useState<{
    fieldErrors: ReturnType<typeof zodToFieldErrors>;
    fieldMap: ReturnType<typeof zodToFieldMap>;
    translated: Record<string, string>;
    summary: string;
  } | null>(null);

  const triggerValidation = () => {
    const parseResult = demoSchema.safeParse({
      name: "A",
      email: "not-an-email",
      age: 10,
    });

    if (!parseResult.success) {
      const fieldErrors = zodToFieldErrors(parseResult.error);
      const fieldMap = zodToFieldMap(parseResult.error);
      const translated = translateFieldErrors(fieldMap, (key) => {
        // Simula traducao: em producao seria t(key)
        const translations: Record<string, string> = {
          "validation.name.min": "Name must have at least 3 characters",
          "validation.email.invalid": "Invalid email address",
          "validation.age.min": "Must be at least 18 years old",
        };
        return translations[key] ?? key;
      });
      const summary = formatValidationSummary(translated);

      setResult({ fieldErrors, fieldMap, translated, summary });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("forms.validationErrors")}</CardTitle>
        <CardDescription>{t("forms.validationErrorsDesc")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button variant="outline" onClick={triggerValidation}>
          {t("forms.triggerValidation")}
        </Button>

        {result && (
          <div className="grid gap-4 lg:grid-cols-3">
            <div className="space-y-2">
              <h4 className="text-sm font-semibold">
                {t("forms.fieldErrors")}
              </h4>
              <pre className="overflow-auto rounded-md bg-muted p-3 text-xs">
                {JSON.stringify(result.fieldErrors, null, 2)}
              </pre>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-semibold">{t("forms.fieldMap")}</h4>
              <pre className="overflow-auto rounded-md bg-muted p-3 text-xs">
                {JSON.stringify(result.fieldMap, null, 2)}
              </pre>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-semibold">{t("forms.summary")}</h4>
              <pre className="overflow-auto whitespace-pre-wrap rounded-md bg-muted p-3 text-xs">
                {result.summary}
              </pre>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
