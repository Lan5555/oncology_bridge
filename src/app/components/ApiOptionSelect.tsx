"use client";

import { useEffect, useId, useState } from "react";
import {
  FORM_OPTIONS_SERVICE,
  type FormContext,
  type FormOption,
  readFormOptions,
} from "@/app/services/form-options-service/form-options-service";

export default function ApiOptionSelect({
  context,
  field,
  label,
  value,
  onChange,
  name,
  required = false,
  disabled = false,
  emptyLabel = "Select an option",
  className = "mb-3 block text-xs font-semibold text-g600",
  inputClassName = "mt-1 w-full rounded-lg border border-g200 bg-w px-3 py-2.5 text-sm font-normal",
}: {
  context: FormContext;
  field: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  name?: string;
  required?: boolean;
  disabled?: boolean;
  emptyLabel?: string;
  className?: string;
  inputClassName?: string;
}) {
  const id = useId();
  const [options, setOptions] = useState<FormOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  // biome-ignore lint/correctness/useExhaustiveDependencies: Retry reloads the same API option group.
  useEffect(() => {
    let current = true;
    setLoading(true);
    setError("");
    setOptions([]);
    void FORM_OPTIONS_SERVICE.options(context)
      .then((response) => {
        if (!current) return;
        if (!response.success)
          throw new Error(response.message || "Options could not be loaded.");
        setOptions(readFormOptions(response.data, context, field));
      })
      .catch((failure) => {
        if (current)
          setError(
            failure instanceof Error
              ? failure.message
              : "Options could not be loaded.",
          );
      })
      .finally(() => {
        if (current) setLoading(false);
      });
    return () => {
      current = false;
    };
  }, [context, field, retry]);
  useEffect(() => {
    if (
      !loading &&
      !error &&
      value &&
      !options.some((option) => option.value === value)
    )
      onChange("");
  }, [loading, error, value, options, onChange]);
  return (
    <div className={className}>
      <label htmlFor={id}>{label}</label>
      <select
        id={id}
        name={name}
        required={required}
        disabled={disabled}
        className={inputClassName}
        value={options.some((option) => option.value === value) ? value : ""}
        onChange={(event) => onChange(event.target.value)}
        aria-describedby={`${id}-help`}
        aria-busy={loading}
      >
        <option value="">
          {loading
            ? "Loading options…"
            : !options.length
              ? "No options available"
              : emptyLabel}
        </option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <div id={`${id}-help`}>
        {error && (
          <p role="alert" className="mt-2 text-xs text-err">
            {error}
          </p>
        )}
        {!loading && !options.length && !error && (
          <p className="mt-2 text-xs text-g500">
            No choices were returned for this field.
          </p>
        )}
        {!loading && (error || !options.length) && (
          <button
            type="button"
            disabled={disabled}
            className="mt-2 text-xs underline"
            onClick={() => setRetry((current) => current + 1)}
          >
            Retry options
          </button>
        )}
      </div>
    </div>
  );
}
