"use client";

import { ReactNode, useState, useEffect, useCallback } from "react";
import { ClerkProvider, useAuth } from "@clerk/nextjs";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ConvexReactClient } from "convex/react";
import { NextIntlClientProvider } from "next-intl";
import { Toaster } from "sonner";
import {
  LocaleContext,
  getStoredLocale,
  setStoredLocale,
  DEFAULT_LOCALE,
  type Locale,
} from "@/lib/i18n";

import itMessages from "@/messages/it.json";
import enMessages from "@/messages/en.json";

const convex = new ConvexReactClient(
  process.env.NEXT_PUBLIC_CONVEX_URL as string
);

const messages: Record<string, Record<string, unknown>> = {
  it: itMessages,
  en: enMessages,
};

export function Providers({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);

  useEffect(() => {
    setLocaleState(getStoredLocale());
  }, []);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    setStoredLocale(newLocale);
  }, []);

  return (
    <ClerkProvider>
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        <LocaleContext.Provider value={{ locale, setLocale }}>
          <NextIntlClientProvider
            locale={locale}
            messages={messages[locale]}
            timeZone="Europe/Rome"
          >
            {children}
            <Toaster
              position="top-right"
              toastOptions={{
                style: {
                  background: "white",
                  color: "black",
                  border: "1px solid #E5E5EA",
                  borderRadius: "12px",
                },
              }}
            />
          </NextIntlClientProvider>
        </LocaleContext.Provider>
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}
