"use client";

import { SignUp } from "@clerk/nextjs";
import { useTranslations } from "next-intl";

export default function SignUpPage() {
  const t = useTranslations("auth");

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-primary mb-2">H-OUSING</h1>
        <p className="text-muted-foreground">{t("subtitle")}</p>
      </div>
      <SignUp
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "shadow-md rounded-xl border border-border/50",
            headerTitle: "text-foreground",
            headerSubtitle: "text-muted-foreground",
            formButtonPrimary:
              "bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg",
            formFieldInput:
              "rounded-lg border-border focus:ring-primary",
            footerActionLink: "text-primary hover:text-primary/80",
          },
        }}
      />
    </div>
  );
}
