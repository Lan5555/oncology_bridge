import { CoreService } from "@/app/hooks/service/core-service";
import { Routes } from "../api-routes";

export type FormContext =
  | "prescription"
  | "marketplace"
  | "settings"
  | "reports";
export type FormOption = { value: string; label: string };

export function readFormOptions(
  data: unknown,
  context: FormContext,
  field: string,
): FormOption[] {
  if (!data || typeof data !== "object")
    throw new Error("Form options could not be read.");
  const record = data as Record<string, unknown>;
  const groups = record.options as Record<string, unknown> | undefined;
  if (record.context !== context || !groups || !Array.isArray(groups[field]))
    throw new Error("The API did not return the requested form options.");
  const values = new Set<string>();
  return groups[field].map((item: unknown) => {
    if (!item || typeof item !== "object")
      throw new Error("Invalid form option.");
    const option = item as Record<string, unknown>;
    if (
      typeof option.value !== "string" ||
      !option.value.trim() ||
      typeof option.label !== "string" ||
      !option.label.trim() ||
      values.has(option.value)
    )
      throw new Error("Invalid or duplicate form option.");
    values.add(option.value);
    return { value: option.value, label: option.label };
  });
}

class FormOptionsService extends CoreService {
  options(context: FormContext) {
    return this.get(Routes.FORM_OPTIONS(context), { facilityOnly: true });
  }
}
export const FORM_OPTIONS_SERVICE = new FormOptionsService();
