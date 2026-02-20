"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, Trash2, Megaphone, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { it, enUS } from "date-fns/locale";
import { useAppLocale } from "@/lib/i18n";
import { Id } from "@/convex/_generated/dataModel";

export default function StaffAnnouncementsPage() {
  const t = useTranslations("announcements");
  const tc = useTranslations("common");
  const { locale } = useAppLocale();
  const dateLocale = locale === "it" ? it : enUS;

  const announcements = useQuery(api.announcements.list);
  const createAnnouncement = useMutation(api.announcements.create);
  const removeAnnouncement = useMutation(api.announcements.remove);

  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deleteId, setDeleteId] = useState<Id<"announcements"> | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [form, setForm] = useState({
    title: "",
    message: "",
    priority: "normal" as "normal" | "important",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!form.title.trim()) newErrors.title = t("titleLabel");
    if (form.message.trim().length < 10) {
      newErrors.message = t("messageMinLength");
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await createAnnouncement({
        title: form.title.trim(),
        message: form.message.trim(),
        priority: form.priority,
      });
      toast.success(t("sent"));
      setForm({ title: "", message: "", priority: "normal" });
      setShowForm(false);
      setErrors({});
    } catch (error) {
      console.error(error);
      toast.error(tc("noResults"));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await removeAnnouncement({ announcementId: deleteId });
      toast.success(t("deleted"));
      setDeleteId(null);
    } catch (error) {
      console.error(error);
      toast.error(tc("noResults"));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="ios-button"
        >
          <Plus className="h-4 w-4 mr-2" />
          {t("new")}
        </Button>
      </div>

      {/* Create form */}
      {showForm && (
        <Card className="ios-card">
          <CardHeader>
            <CardTitle className="text-base">{t("create")}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>{t("titleLabel")}</Label>
                <Input
                  placeholder={t("titlePlaceholder")}
                  value={form.title}
                  onChange={(e) => {
                    setForm({ ...form, title: e.target.value });
                    setErrors({ ...errors, title: "" });
                  }}
                  className={errors.title ? "border-destructive" : ""}
                />
              </div>

              <div className="space-y-2">
                <Label>{tc("description")}</Label>
                <Textarea
                  placeholder={t("messagePlaceholder")}
                  value={form.message}
                  onChange={(e) => {
                    setForm({ ...form, message: e.target.value });
                    if (e.target.value.trim().length >= 10) {
                      setErrors({ ...errors, message: "" });
                    }
                  }}
                  rows={4}
                  className={errors.message ? "border-destructive" : ""}
                />
                {errors.message && (
                  <p className="text-xs text-destructive">{errors.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>{t("priorityLabel")}</Label>
                <Select
                  value={form.priority}
                  onValueChange={(v) => setForm({ ...form, priority: v as "normal" | "important" })}
                >
                  <SelectTrigger className="w-40 h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">{t("normal")}</SelectItem>
                    <SelectItem value="important">
                      <div className="flex items-center gap-1.5">
                        <AlertTriangle className="h-3.5 w-3.5 text-destructive" />
                        {t("important")}
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2">
                <Button
                  type="submit"
                  disabled={loading}
                  className="ios-button"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      {t("sending")}
                    </>
                  ) : (
                    tc("submit")
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false);
                    setErrors({});
                  }}
                >
                  {tc("cancel")}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Announcements list */}
      {!announcements ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 bg-muted rounded-xl animate-pulse" />
          ))}
        </div>
      ) : announcements.length === 0 ? (
        <div className="text-center py-12 ios-card rounded-xl">
          <Megaphone className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">{t("noAnnouncements")}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {announcements.map((a) => (
            <Card
              key={a._id}
              className={`ios-card ${a.priority === "important" ? "border-destructive/30" : ""}`}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {a.priority === "important" && (
                        <Badge variant="destructive" className="text-xs">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          {t("important")}
                        </Badge>
                      )}
                      <h3 className="font-semibold text-sm truncate">{a.title}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {a.message}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {a.authorName} &middot;{" "}
                      {formatDistanceToNow(new Date(a.createdAt), {
                        addSuffix: true,
                        locale: dateLocale,
                      })}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0"
                    onClick={() => setDeleteId(a._id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Delete confirmation dialog */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="rounded-xl">
          <DialogHeader>
            <DialogTitle>{t("delete")}</DialogTitle>
            <DialogDescription>{t("deleteConfirm")}</DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleteId(null)}>
              {tc("cancel")}
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                tc("delete")
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
