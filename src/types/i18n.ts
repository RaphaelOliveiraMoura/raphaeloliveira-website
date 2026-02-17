import auth from "../../messages/pt-BR/auth.json";
import common from "../../messages/pt-BR/common.json";
import errors from "../../messages/pt-BR/errors.json";
import portfolio from "../../messages/pt-BR/portfolio.json";
import validation from "../../messages/pt-BR/validation.json";

type Messages = {
  common: typeof common;
  auth: typeof auth;
  errors: typeof errors;
  portfolio: typeof portfolio;
  validation: typeof validation;
};

declare module "next-intl" {
  interface AppConfig {
    Messages: Messages;
  }
}
