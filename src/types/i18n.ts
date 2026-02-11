import common from "../../messages/pt-BR/common.json";
import auth from "../../messages/pt-BR/auth.json";
import errors from "../../messages/pt-BR/errors.json";

type Messages = {
  common: typeof common;
  auth: typeof auth;
  errors: typeof errors;
};

declare module "next-intl" {
  interface AppConfig {
    Messages: Messages;
  }
}
