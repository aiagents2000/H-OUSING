import { toast } from "sonner";

export function handleError(error: unknown, fallbackMessage: string) {
  console.error(error);
  if (error instanceof Error) {
    toast.error(error.message);
  } else {
    toast.error(fallbackMessage);
  }
}

export function handleSuccess(message: string) {
  toast.success(message);
}
