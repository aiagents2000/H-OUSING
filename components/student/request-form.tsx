"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Loader2, Camera, X, CheckCircle2 } from "lucide-react";
import { REQUEST_CATEGORIES, REQUEST_PRIORITIES } from "@/lib/constants";
import { compressImage } from "@/lib/image-compression";
import { validateImageFile } from "@/lib/validation";
import { toast } from "sonner";
import { Id } from "@/convex/_generated/dataModel";

export function RequestForm() {
  const router = useRouter();
  const t = useTranslations();
  const currentUser = useQuery(api.users.getCurrentUser);
  const createRequest = useMutation(api.maintenanceRequests.createRequest);
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);

  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({
    category: "",
    priority: "",
    description: "",
  });

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateImageFile(file);
    if (!validation.valid) {
      const errorMsg = validation.errorCode === "invalid_type"
        ? t("errors.imageInvalidType")
        : t("errors.imageTooLarge");
      toast.error(errorMsg);
      return;
    }

    try {
      const compressed = await compressImage(file);
      setImageFile(compressed);
      setImagePreview(URL.createObjectURL(compressed));
    } catch {
      toast.error(t("errors.imageProcessing"));
    }
  };

  const removeImage = () => {
    setImageFile(null);
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(null);
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!form.category) newErrors.category = t("requests.selectCategory");
    if (!form.priority) newErrors.priority = t("requests.selectPriority");
    if (form.description.trim().length < 20) {
      newErrors.description = t("requests.descriptionMinLength");
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      let photoStorageId: Id<"_storage"> | undefined;

      if (imageFile) {
        const uploadUrl = await generateUploadUrl();
        const result = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": imageFile.type },
          body: imageFile,
        });
        if (!result.ok) throw new Error("Failed to upload image");
        const { storageId } = await result.json();
        photoStorageId = storageId;
      }

      await createRequest({
        category: form.category as "plumbing" | "electrical" | "cleaning" | "boiler" | "other",
        priority: form.priority as "low" | "medium" | "high" | "urgent",
        description: form.description,
        photoStorageId,
      });

      setShowSuccess(true);
    } catch (error) {
      console.error(error);
      toast.error(t("errors.createRequest"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Card className="ios-card max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>{t("requests.create")}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Room info auto-filled */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("common.room")}</Label>
                <Input
                  value={
                    currentUser?.roomNumber
                      ? `${currentUser.roomNumber}`
                      : ""
                  }
                  disabled
                  className="bg-muted"
                />
              </div>
              <div className="space-y-2">
                <Label>{t("common.building")}</Label>
                <Input
                  value={currentUser?.building || ""}
                  disabled
                  className="bg-muted"
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground -mt-2">
              {t("requests.autoFilledRoom")}
            </p>

            {/* Category */}
            <div className="space-y-2">
              <Label>{t("common.category")}</Label>
              <Select
                value={form.category}
                onValueChange={(v) => {
                  setForm({ ...form, category: v });
                  setErrors({ ...errors, category: "" });
                }}
              >
                <SelectTrigger className={`h-12 ${errors.category ? "border-destructive" : ""}`}>
                  <SelectValue placeholder={t("requests.selectCategory")} />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(REQUEST_CATEGORIES).map(([key, config]) => {
                    const CatIcon = config.icon;
                    return (
                      <SelectItem key={key} value={key}>
                        <div className="flex items-center gap-2">
                          <CatIcon
                            className="h-4 w-4"
                            style={{ color: config.color }}
                          />
                          {t(`categories.${key}`)}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              {errors.category && (
                <p className="text-xs text-destructive">{errors.category}</p>
              )}
            </div>

            {/* Priority */}
            <div className="space-y-2">
              <Label>{t("common.priority")}</Label>
              <Select
                value={form.priority}
                onValueChange={(v) => {
                  setForm({ ...form, priority: v });
                  setErrors({ ...errors, priority: "" });
                }}
              >
                <SelectTrigger className={`h-12 ${errors.priority ? "border-destructive" : ""}`}>
                  <SelectValue placeholder={t("requests.selectPriority")} />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(REQUEST_PRIORITIES).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center gap-2">
                        <span
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: config.color }}
                        />
                        {t(`priorities.${key}`)}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.priority && (
                <p className="text-xs text-destructive">{errors.priority}</p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label>{t("common.description")}</Label>
              <Textarea
                placeholder={t("requests.descriptionPlaceholder")}
                value={form.description}
                onChange={(e) => {
                  setForm({ ...form, description: e.target.value });
                  if (e.target.value.trim().length >= 20) {
                    setErrors({ ...errors, description: "" });
                  }
                }}
                rows={3}
                className={errors.description ? "border-destructive" : ""}
              />
              <div className="flex justify-between">
                {errors.description ? (
                  <p className="text-xs text-destructive">{errors.description}</p>
                ) : (
                  <span />
                )}
                <p className="text-xs text-muted-foreground">
                  {form.description.trim().length}/20 min
                </p>
              </div>
            </div>

            {/* Photo */}
            <div className="space-y-2">
              <Label>{t("requests.uploadPhoto")}</Label>
              {imagePreview ? (
                <div className="relative inline-block">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="h-24 w-24 rounded-xl object-cover"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute -top-2 -right-2 h-6 w-6 bg-destructive text-white rounded-full flex items-center justify-center"
                    aria-label="Remove image"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center h-28 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary/50 transition-colors">
                  <Camera className="h-6 w-6 text-primary/50 mb-1" />
                  <span className="text-xs text-muted-foreground">
                    {t("requests.uploadPhotoDesc")}
                  </span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full ios-button h-12 text-base font-semibold shadow-[0_4px_12px_rgba(0,122,255,0.25)]"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("requests.submitting")}
                </>
              ) : (
                t("requests.submit")
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Dialog open={showSuccess} onOpenChange={() => {
        setShowSuccess(false);
        router.push("/requests");
      }}>
        <DialogContent className="text-center rounded-xl">
          <DialogHeader>
            <div className="mx-auto mb-4 animate-[bounce_0.5s_ease-in-out_1]">
              <CheckCircle2 className="h-16 w-16 text-[#34C759]" />
            </div>
            <DialogTitle className="text-xl">{t("requests.created")}</DialogTitle>
            <DialogDescription>
              {t("requests.createdDesc")}
            </DialogDescription>
          </DialogHeader>
          <Button
            onClick={() => {
              setShowSuccess(false);
              router.push("/requests");
            }}
            className="ios-button"
          >
            {t("requests.title")}
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}
