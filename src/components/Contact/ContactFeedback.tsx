import { CheckCircle2, XCircle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";

interface ContactFeedbackProps {
  feedback: {
    open: boolean;
    type: "success" | "error";
    title: string;
    description: string;
    emailStatus?: "sent" | "failed";
  };
  onOpenChange: (open: boolean) => void;
  confirmLabel: string;
}

export function ContactFeedback({ feedback, onOpenChange, confirmLabel }: ContactFeedbackProps) {
  return (
    <AlertDialog
      open={feedback.open}
      onOpenChange={onOpenChange}
    >
      <AlertDialogContent className="max-w-[400px] rounded-3xl border-none bg-white dark:bg-zinc-900 p-8">
        <div className="flex flex-col items-center text-center">
          <div className={`mb-6 flex size-20 items-center justify-center rounded-full ring-8 ${
            feedback.type === "success" 
              ? "bg-emerald-100 text-emerald-600 ring-emerald-50 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/5"
              : "bg-red-100 text-red-600 ring-red-50 dark:bg-red-500/10 dark:text-red-400 dark:ring-red-500/5"
          }`}>
            {feedback.type === "success" ? (
              <CheckCircle2 className="size-10" />
            ) : (
              <XCircle className="size-10" />
            )}
          </div>
          
          <AlertDialogHeader className="space-y-2">
            <AlertDialogTitle className="text-2xl font-bold text-zinc-900 dark:text-white">
              {feedback.title}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
              {feedback.description}
              {feedback.emailStatus === "failed" && (
                <p className="mt-2 text-amber-600 dark:text-amber-400">
                  ⚠️ El mensaje se guardó, pero el correo no pudo enviarse. Revisá la configuración del servidor.
                </p>
              )}
              {feedback.emailStatus === "sent" && (
                <p className="mt-2 text-emerald-600 dark:text-emerald-400">
                  ✓ Correo enviado correctamente.
                </p>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <AlertDialogFooter className="mt-8 w-full sm:justify-center">
            <AlertDialogAction className={`w-full rounded-xl py-6 font-semibold text-white transition-all duration-200 active:scale-95 ${
              feedback.type === "success"
                ? "bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600"
                : "bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600"
            }`}>
              {confirmLabel}
            </AlertDialogAction>
          </AlertDialogFooter>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
