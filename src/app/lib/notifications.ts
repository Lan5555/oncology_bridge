import { toast } from "sonner";

/** Use action outcomes, not message wording, to choose the notification tone. */
export function notifyResult(
  response: { success: boolean; message?: string },
  successMessage: string,
  errorMessage: string,
) {
  const message =
    response.message || (response.success ? successMessage : errorMessage);
  if (response.success) toast.success(message);
  else toast.error(message);
  return response.success;
}
