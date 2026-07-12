import { useForm } from "react-hook-form";
import { Send } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";
import { EditableText } from "@/features/admin/InlineEdit";

interface ContactFormProps {
  onSubmit: (data: any) => Promise<void>;
  updateField: (field: string, value: string) => void;
  t: (key: string) => string;
}

export function ContactForm({ onSubmit, updateField, t }: ContactFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ mode: "onChange" });

  return (
    <div className="flex flex-col rounded-2xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-950/75 p-7">
      <p className="text-xs font-medium uppercase tracking-widest text-zinc-500 dark:text-zinc-500 mb-6">
        {t("contact.form.title")}
      </p>

      <form 
        onSubmit={handleSubmit(async (data) => {
          await onSubmit(data);
          reset();
        })}
        noValidate 
        className="flex flex-col flex-1 gap-5"
      >
        <div>
          <Label htmlFor="name" className="text-sm text-zinc-600 dark:text-zinc-400 mb-1.5 block">
            <EditableText
              value={String(t("contact.form.name"))}
              displayValue={String(t("contact.form.name"))}
              onSave={(value) => updateField("form.name", value)}
            />
          </Label>
          <Input
            id="name"
            {...register("name", {
              required: t("contact.form.errors.required") as string,
              minLength: {
                value: 2,
                message: t("contact.form.errors.minLength") as string,
              },
            })}
            placeholder={String(t("contact.form.namePlaceholder"))}
            disabled={isSubmitting}
            className={`bg-zinc-50 dark:bg-zinc-900/40 border-zinc-200 dark:border-white/10 focus-visible:ring-violet-500 ${
              errors.name ? "border-red-500 focus-visible:ring-red-500" : ""
            }`}
          />
          {errors.name && (
            <p className="text-xs text-red-500 mt-1">
              {errors.name.message as string}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="email" className="text-sm text-zinc-600 dark:text-zinc-400 mb-1.5 block">
            <EditableText
              value={String(t("contact.form.email"))}
              displayValue={String(t("contact.form.email"))}
              onSave={(value) => updateField("form.email", value)}
            />
          </Label>
          <Input
            id="email"
            type="email"
            {...register("email", {
              required: t("contact.form.errors.required") as string,
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: t("contact.form.errors.invalidEmail") as string,
              },
            })}
            placeholder={String(t("contact.form.emailPlaceholder"))}
            disabled={isSubmitting}
            className={`bg-zinc-50 dark:bg-zinc-900/40 border-zinc-200 dark:border-white/10 focus-visible:ring-violet-500 ${
              errors.email ? "border-red-500 focus-visible:ring-red-500" : ""
            }`}
          />
          {errors.email && (
            <p className="text-xs text-red-500 mt-1">
              {errors.email.message as string}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="company" className="text-sm text-zinc-600 dark:text-zinc-400 mb-1.5 block">
            <EditableText
              value={String(t("contact.form.company") || "Company (Optional)")}
              displayValue={String(t("contact.form.company") || "Company (Optional)")}
              onSave={(value) => updateField("form.company", value)}
            />
          </Label>
          <Input
            id="company"
            {...register("company")}
            placeholder={String(t("contact.form.companyPlaceholder") || "Where do you work?")}
            disabled={isSubmitting}
            className="bg-zinc-50 dark:bg-zinc-900/40 border-zinc-200 dark:border-white/10 focus-visible:ring-violet-500"
          />
        </div>

        <div className="flex flex-col flex-1">
          <Label htmlFor="message" className="text-sm text-zinc-600 dark:text-zinc-400 mb-1.5 block">
            <EditableText
              value={String(t("contact.form.message"))}
              displayValue={String(t("contact.form.message"))}
              onSave={(value) => updateField("form.message", value)}
            />
          </Label>
          <Textarea
            id="message"
            {...register("message", {
              required: t("contact.form.errors.required") as string,
              minLength: {
                value: 5,
                message: t("contact.form.errors.minLength") as string,
              },
            })}
            placeholder={String(t("contact.form.messagePlaceholder"))}
            disabled={isSubmitting}
            className={`flex-1 min-h-[140px] bg-zinc-50 dark:bg-zinc-900/40 border-zinc-200 dark:border-white/10 focus-visible:ring-violet-500 resize-none ${
              errors.message ? "border-red-500 focus-visible:ring-red-500" : ""
            }`}
          />
          {errors.message && (
            <p className="text-xs text-red-500 mt-1">
              {errors.message.message as string}
            </p>
          )}
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full gap-2 bg-violet-600 hover:bg-violet-700 text-white"
        >
          {isSubmitting ? (
            <>
              <div className="size-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              {String(t("contact.form.sending"))}
            </>
          ) : (
            <>
              <Send className="size-4" />
              {String(t("contact.form.send"))}
            </>
          )}
        </Button>
      </form>
    </div>
  );
}
