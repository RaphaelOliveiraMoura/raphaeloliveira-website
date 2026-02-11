import common from "../../messages/pt-BR/common.json";
import auth from "../../messages/pt-BR/auth.json";
import errors from "../../messages/pt-BR/errors.json";
import examples from "../../messages/pt-BR/examples.json";

type Messages = {
  common: typeof common;
  auth: typeof auth;
  errors: typeof errors;
  examples: typeof examples;
};

declare module "next-intl" {
  interface AppConfig {
    Messages: Messages;
  }
}
