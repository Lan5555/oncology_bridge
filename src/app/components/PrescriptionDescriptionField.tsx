"use client";

import { useId } from "react";

export default function PrescriptionDescriptionField({
  value,
  onChange,
  disabled = false,
}: {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  const id = useId();
  return (
    <div className="mb-4">
      <label htmlFor={id} className="block text-xs font-semibold text-g600">
        Description (optional)
      </label>
      <textarea
        id={id}
        rows={4}
        maxLength={2000}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        aria-describedby={`${id}-help ${id}-count`}
        placeholder="Add relevant prescription notes"
        className="mt-1 w-full resize-y rounded-lg border border-g200 bg-w px-3 py-2.5 text-sm text-g800 focus-visible:outline-2 focus-visible:outline-p disabled:opacity-60"
      />
      <div className="mt-1 flex justify-between gap-4 text-xs text-g500">
        <p id={`${id}-help`}>
          Use up to 2,000 characters. Avoid patient names and contact details.
        </p>
        <span id={`${id}-count`} className="shrink-0 tabular-nums">
          {value.length.toLocaleString()} / 2,000
        </span>
      </div>
    </div>
  );
}
