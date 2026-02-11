"use client";

import { useCallback, useSyncExternalStore } from "react";

export interface CookieConsent {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
}

const CONSENT_KEY = "core-stack-cookie-consent";
const CONSENT_EVENT = "core-stack-consent-change";

const DEFAULT_CONSENT: CookieConsent = {
  essential: true,
  analytics: false,
  marketing: false,
};

function dispatchConsentEvent() {
  window.dispatchEvent(new CustomEvent(CONSENT_EVENT));
}

function subscribe(callback: () => void) {
  const handleStorage = (e: StorageEvent) => {
    if (e.key === CONSENT_KEY || e.key === null) callback();
  };
  window.addEventListener("storage", handleStorage);
  window.addEventListener(CONSENT_EVENT, callback);
  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(CONSENT_EVENT, callback);
  };
}

function getSnapshot() {
  try {
    return localStorage.getItem(CONSENT_KEY);
  } catch {
    return null;
  }
}

function getServerSnapshot() {
  return null;
}

interface UseCookieConsentReturn {
  consent: CookieConsent;
  shouldShow: boolean;
  accept: () => void;
  decline: () => void;
  updateConsent: (consent: Partial<CookieConsent>) => void;
}

export function useCookieConsent(): UseCookieConsentReturn {
  const raw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const consent: CookieConsent = raw
    ? (JSON.parse(raw) as CookieConsent)
    : DEFAULT_CONSENT;
  const shouldShow = raw === null;

  const saveConsent = useCallback((newConsent: CookieConsent) => {
    try {
      localStorage.setItem(CONSENT_KEY, JSON.stringify(newConsent));
      dispatchConsentEvent();
    } catch {
      // localStorage indisponivel
    }
  }, []);

  const accept = useCallback(() => {
    saveConsent({ essential: true, analytics: true, marketing: true });
  }, [saveConsent]);

  const decline = useCallback(() => {
    saveConsent({ essential: true, analytics: false, marketing: false });
  }, [saveConsent]);

  const updateConsent = useCallback(
    (partial: Partial<CookieConsent>) => {
      saveConsent({ ...consent, ...partial, essential: true });
    },
    [consent, saveConsent]
  );

  return { consent, shouldShow, accept, decline, updateConsent };
}
