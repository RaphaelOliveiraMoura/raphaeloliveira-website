import type { FirebaseApp } from "firebase/app";
import { getApp, getApps, initializeApp } from "firebase/app";
import type { Auth } from "firebase/auth";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
};

/**
 * Verifica se o Firebase esta configurado (API key presente).
 * Usado para esconder botoes de social login quando Firebase nao esta disponivel.
 */
export const isSocialLoginEnabled = !!firebaseConfig.apiKey;

let _app: FirebaseApp | null = null;
let _auth: Auth | null = null;

/**
 * Retorna a instancia do Firebase Auth, inicializando sob demanda.
 * Lanca erro se chamado sem Firebase configurado.
 */
export function getFirebaseAuth(): Auth {
  if (!isSocialLoginEnabled) {
    throw new Error(
      "Firebase is not configured. Set NEXT_PUBLIC_FIREBASE_API_KEY to enable social login.",
    );
  }

  if (!_app) {
    _app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  }

  if (!_auth) {
    _auth = getAuth(_app);
  }

  return _auth;
}
