import { type App, cert, getApps, initializeApp } from "firebase-admin/app";
import { type DecodedIdToken, getAuth } from "firebase-admin/auth";

import { logger } from "../../lib/logger";

const log = logger.child({ module: "firebase" });

export interface FirebaseConfig {
  projectId: string;
  clientEmail: string;
  privateKey: string;
}

export interface FirebaseUser {
  uid: string;
  email: string | undefined;
  name: string | undefined;
  picture: string | undefined;
  provider: string;
}

/**
 * Firebase Admin adapter for social login.
 *
 * Verifies Firebase ID tokens issued by the client-side Firebase SDK
 * (Google, GitHub, Apple, etc.) and extracts user information.
 */
export class FirebaseAdapter {
  private app: App;

  constructor(config: FirebaseConfig) {
    // Reuse existing Firebase app if already initialized
    const existingApps = getApps();
    if (existingApps.length > 0) {
      this.app = existingApps[0]!;
    } else {
      this.app = initializeApp({
        credential: cert({
          projectId: config.projectId,
          clientEmail: config.clientEmail,
          privateKey: config.privateKey.replace(/\\n/g, "\n"),
        }),
      });
    }

    log.info({ projectId: config.projectId }, "Firebase Admin initialized");
  }

  /**
   * Verify a Firebase ID token and return the decoded user info.
   *
   * @throws Error if the token is invalid or expired.
   */
  async verifyIdToken(idToken: string): Promise<FirebaseUser> {
    const auth = getAuth(this.app);
    const decoded: DecodedIdToken = await auth.verifyIdToken(idToken);

    // Determine the provider from the sign-in provider
    const provider = decoded.firebase?.sign_in_provider ?? "unknown";

    // Map Firebase provider IDs to friendly names
    const providerMap: Record<string, string> = {
      "google.com": "google",
      "github.com": "github",
      "apple.com": "apple",
      "facebook.com": "facebook",
      "twitter.com": "twitter",
      password: "email",
    };

    return {
      uid: decoded.uid,
      email: decoded.email,
      name: decoded.name as string | undefined,
      picture: decoded.picture as string | undefined,
      provider: providerMap[provider] ?? provider,
    };
  }

  /**
   * Verify that Firebase Admin is properly configured.
   */
  async verify(): Promise<boolean> {
    try {
      const auth = getAuth(this.app);
      // A simple operation to check connectivity
      await auth.listUsers(1);
      return true;
    } catch {
      return false;
    }
  }
}
