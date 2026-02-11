"use client";

import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { z } from "zod";

import { useTranslations } from "@/lib/i18n";
import { toast } from "@/lib/feedback";
import { emailSchema, cpfSchema, phoneBrSchema, cepSchema } from "@/lib/validation";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import {
  Form,
  MaskedInput,
  LoadingButton,
  FileUpload,
} from "@/components/shared";
import { Can, PermissionButton } from "@/components/auth";
import { Breadcrumbs } from "@/components/navigation";

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

                <PermissionButton
                  permission="posts:create"
                  variant="outline"
                >
                  {t("forms.editor")} Action
                </PermissionButton>

                <PermissionButton
                  permission="posts:read"
                  variant="secondary"
                >
                  {t("forms.viewer")} Action
                </PermissionButton>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
