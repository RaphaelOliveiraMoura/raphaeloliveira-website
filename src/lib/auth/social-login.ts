import {
  GithubAuthProvider,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";

import { logger } from "@/lib/telemetry/logger";

import { getFirebaseAuth } from "./firebase";

export type SocialProvider = "google" | "github";

interface SocialLoginResult {
  idToken: string;
  provider: SocialProvider;
}

const providers = {
  google: () => new GoogleAuthProvider(),
  github: () => new GithubAuthProvider(),
} as const;

/**
 * Abre popup de autenticacao social via Firebase e retorna o idToken.
 * O idToken deve ser enviado ao backend via POST /api/auth/social.
 * Firebase Auth e inicializado sob demanda na primeira chamada.
 */
export async function signInWithSocialProvider(
  provider: SocialProvider,
): Promise<SocialLoginResult> {
  const authProvider = providers[provider]();
  const firebaseAuth = getFirebaseAuth();

  try {
    const result = await signInWithPopup(firebaseAuth, authProvider);
    const idToken = await result.user.getIdToken();

    return { idToken, provider };
  } catch (error) {
    logger.error("Social login failed", error);
    throw error;
  }
}
