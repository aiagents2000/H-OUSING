"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GraduationCap, Shield, Loader2 } from "lucide-react";
import { getRoomNumbers, BUILDINGS } from "@/lib/constants";

export default function OnboardingPage() {
  const { user } = useUser();
  const router = useRouter();
  const t = useTranslations("onboarding");
  const tc = useTranslations("common");
  const createUser = useMutation(api.users.createUser);
  const addOccupant = useMutation(api.rooms.addOccupant);
  const existingUser = useQuery(
    api.users.getUserByClerkId,
    user?.id ? { clerkId: user.id } : "skip"
  );

  const [step, setStep] = useState<"role" | "details">("role");
  const [role, setRole] = useState<"student" | "staff" | null>(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    fullName: user?.fullName || "",
    roomNumber: "",
    building: "" as "" | "A" | "B",
    courseOfStudy: "",
    studentId: "",
  });

  // If user already exists, redirect
  useEffect(() => {
    if (existingUser) {
      router.push(existingUser.role === "staff" ? "/staff/dashboard" : "/dashboard");
    }
  }, [existingUser, router]);

  if (existingUser || existingUser === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const handleSubmit = async () => {
    if (!user || !role) return;
    setLoading(true);

    try {
      const userId = await createUser({
        clerkId: user.id,
        email: user.primaryEmailAddress?.emailAddress || "",
        fullName: form.fullName,
        role,
        photoUrl: user.imageUrl,
        ...(role === "student"
          ? {
              roomNumber: form.roomNumber,
              building: form.building as "A" | "B",
              courseOfStudy: form.courseOfStudy,
              studentId: form.studentId,
            }
          : {}),
      });

      if (role === "student" && form.roomNumber && form.building) {
        await addOccupant({
          roomNumber: form.roomNumber,
          building: form.building as "A" | "B",
          userId,
        });
      }

      router.push(role === "staff" ? "/staff/dashboard" : "/dashboard");
    } catch (error) {
      console.error("Onboarding error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <h1 className="text-2xl font-bold text-primary mb-1">H-OUSING</h1>
          <CardTitle className="text-xl">{t("title")}</CardTitle>
          <CardDescription>{t("subtitle")}</CardDescription>
        </CardHeader>
        <CardContent>
          {step === "role" ? (
            <div className="space-y-4">
              <p className="text-sm font-medium text-center mb-4">{t("role")}</p>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => {
                    setRole("student");
                    setStep("details");
                  }}
                  className="flex flex-col items-center gap-3 p-6 rounded-xl border-2 border-border hover:border-primary hover:bg-primary/5 transition-all duration-200"
                >
                  <GraduationCap className="h-10 w-10 text-primary" />
                  <span className="font-semibold">{t("student")}</span>
                </button>
                <button
                  onClick={() => {
                    setRole("staff");
                    setStep("details");
                  }}
                  className="flex flex-col items-center gap-3 p-6 rounded-xl border-2 border-border hover:border-secondary hover:bg-secondary/5 transition-all duration-200"
                >
                  <Shield className="h-10 w-10 text-secondary" />
                  <span className="font-semibold">{t("staff")}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">{t("fullName")}</Label>
                <Input
                  id="fullName"
                  placeholder={t("fullNamePlaceholder")}
                  value={form.fullName}
                  onChange={(e) =>
                    setForm({ ...form, fullName: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>{t("email")}</Label>
                <Input
                  value={user?.primaryEmailAddress?.emailAddress || ""}
                  disabled
                  className="bg-muted"
                />
              </div>

              {role === "student" && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{t("roomNumber")}</Label>
                      <Select
                        value={form.roomNumber}
                        onValueChange={(v) =>
                          setForm({ ...form, roomNumber: v })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={t("selectRoom")} />
                        </SelectTrigger>
                        <SelectContent>
                          {getRoomNumbers().map((num) => (
                            <SelectItem key={num} value={num}>
                              {num}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>{t("buildingSelect")}</Label>
                      <Select
                        value={form.building}
                        onValueChange={(v) =>
                          setForm({ ...form, building: v as "A" | "B" })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={t("buildingSelect")} />
                        </SelectTrigger>
                        <SelectContent>
                          {BUILDINGS.map((b) => (
                            <SelectItem key={b} value={b}>
                              {`${t("buildingSelect")} ${b}`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>{t("courseOfStudy")}</Label>
                    <Input
                      placeholder={t("courseOfStudyPlaceholder")}
                      value={form.courseOfStudy}
                      onChange={(e) =>
                        setForm({ ...form, courseOfStudy: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t("studentId")}</Label>
                    <Input
                      placeholder={t("studentIdPlaceholder")}
                      value={form.studentId}
                      onChange={(e) =>
                        setForm({ ...form, studentId: e.target.value })
                      }
                    />
                  </div>
                </>
              )}

              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setStep("role")}
                  className="flex-1"
                >
                  {tc("back")}
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={
                    loading ||
                    !form.fullName ||
                    (role === "student" &&
                      (!form.roomNumber || !form.building))
                  }
                  className="flex-1 ios-button"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t("completing")}
                    </>
                  ) : (
                    t("complete")
                  )}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
