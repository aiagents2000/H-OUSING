"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { ArrowLeft, ExternalLink, Loader2 } from "lucide-react";

const HOLIDOIT_URL =
  "https://www.holidoit.com/embed/web/937c14a4-eddc-4a12-8d16-e67ec4c199f7?with_script=true&language_selector=true&holidoit_logo=true&partner_logo=true";

export default function MarinaBookPage() {
  const t = useTranslations("marina");
  const [loaded, setLoaded] = useState(false);
  const [showFallback, setShowFallback] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!loaded) setShowFallback(true);
    }, 6000);
    return () => clearTimeout(timer);
  }, [loaded]);

  return (
    <div className="flex flex-col h-[calc(100dvh-3rem-2rem-6rem)] lg:h-[calc(100dvh-3.5rem-4rem)] -mx-4 md:-mx-6 lg:-mx-8 -mt-4 md:-mt-6 lg:-mt-8">
      <div className="flex items-center justify-between gap-3 px-4 md:px-6 lg:px-8 py-3 border-b border-border/50 shrink-0 bg-background">
        <Link
          href="/room"
          className="flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("title")}
        </Link>
        <a
          href={HOLIDOIT_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          {t("openInNewTab")}
        </a>
      </div>

      <div className="relative flex-1 min-h-0 bg-muted/30">
        {!loaded && !showFallback && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 z-10">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">{t("bookServicesLoading")}</p>
          </div>
        )}

        {showFallback && !loaded ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-6 text-center z-10">
            <p className="font-semibold">{t("bookServicesFallbackTitle")}</p>
            <p className="text-sm text-muted-foreground max-w-sm">
              {t("bookServicesFallbackBody")}
            </p>
            <a
              href={HOLIDOIT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-white text-sm font-medium ios-button"
            >
              <ExternalLink className="h-4 w-4" />
              {t("openInNewTab")}
            </a>
          </div>
        ) : (
          <iframe
            ref={iframeRef}
            src={HOLIDOIT_URL}
            title={t("bookServicesTitle")}
            onLoad={() => setLoaded(true)}
            referrerPolicy="origin-when-cross-origin"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation"
            allow="payment; clipboard-write"
            className="absolute inset-0 w-full h-full border-0"
          />
        )}
      </div>
    </div>
  );
}
