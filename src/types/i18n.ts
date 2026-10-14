import auth from "../../messages/pt-BR/auth.json";
import common from "../../messages/pt-BR/common.json";
import desk from "../../messages/pt-BR/desk.json";
import errors from "../../messages/pt-BR/errors.json";
import validation from "../../messages/pt-BR/validation.json";

type Messages = {
  common: typeof common;
  auth: typeof auth;
  errors: typeof errors;
  desk: typeof desk;
  validation: typeof validation;
};

declare module "next-intl" {
  interface AppConfig {
    Messages: Messages;
  }
}
