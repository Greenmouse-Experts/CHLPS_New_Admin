import { useQuery } from "@tanstack/react-query";
import { useEffect, useState, type PropsWithChildren } from "react";
import { useFormContext } from "react-hook-form";
import type { ApiResponse } from "@/api/simpleApi";
import apiClient from "@/api/simpleApi";

interface SimpleSelectProps<T = any> extends PropsWithChildren {
  route: string;
  value?: string | null;
  onChange?: (value: string | null) => void;
  label?: string;
  name?: string;
  placeholder?: string;
  autoSelectFirst?: boolean;
  render: (item: T, index: number) => React.ReactNode;
  extractItems?: (data: any) => T[];
}

export default function SimpleSelect<T = any>(props: SimpleSelectProps<T>) {
  const {
    route,
    value,
    onChange,
    label,
    name,
    placeholder = "Select an option",
    autoSelectFirst = true,
    render,
    extractItems,
  } = props;

  // SAFE: prevents crash when no FormProvider exists
  let formState: any = null;
  let formValue: any = undefined;
  let setValue: any = null;
  try {
    const ctx = useFormContext();
    if (ctx) {
      formState = ctx.formState;
      setValue = ctx.setValue;
      if (name) {
        formValue = ctx.watch(name);
      }
    }
  } catch {
    formState = null;
  }

  const error = name && formState ? formState.errors?.[name] : undefined;

  // Controlled when a `value` prop is supplied, or tracked via react-hook-form
  const isControlled = value !== undefined;
  const isHookForm = !isControlled && Boolean(name && setValue);
  const [internalValue, setInternalValue] = useState<string | null>(null);

  const currentValue = isControlled
    ? (value ?? null)
    : isHookForm
      ? (formValue ?? null)
      : internalValue;

  const query = useQuery({
    queryKey: ["select", route],
    queryFn: async (): Promise<ApiResponse<T[]>> => {
      const resp = await apiClient.get(route);
      return resp.data as ApiResponse<T[]>;
    },
  });

  const raw = query.data?.data as any;
  const items: T[] = extractItems
    ? extractItems(raw)
    : Array.isArray(raw)
      ? raw
      : Array.isArray(raw?.data)
        ? raw.data
        : Array.isArray(raw?.items)
          ? raw.items
          : [];

  const handleChange = (next: string | null) => {
    const val = next === "" || next === "null" ? null : next;
    if (!isControlled && !isHookForm) setInternalValue(val);
    if (isHookForm && setValue && name) {
      setValue(name, val ?? "", { shouldValidate: true, shouldDirty: true });
    }
    onChange?.(val);
  };

  // Auto-select first item when loaded if none is selected
  useEffect(() => {
    if (!items || items.length === 0) return;
    const hasValue =
      currentValue !== null &&
      currentValue !== undefined &&
      currentValue !== "" &&
      currentValue !== "null";

    if (!hasValue && (autoSelectFirst || items.length === 1)) {
      const first = items[0] as any;
      const firstVal = first?.id ?? first?.value ?? first?._id ?? null;
      if (firstVal) {
        handleChange(String(firstVal));
      }
    }
  }, [items, currentValue, autoSelectFirst]);

  if (query.isLoading)
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={`select-${route}`}
            className="mb-2 fieldset-label font-semibold"
          >
            <span className="text-sm">{label}</span>
          </label>
        )}
        <select
          disabled
          name={name || `select-${route}`}
          className="select select-md w-full select-bordered"
          id={`select-${route}`}
        >
          <option value="">Loading options...</option>
        </select>
      </div>
    );

  if (query.isError)
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={`select-${route}`}
            className="mb-2 fieldset-label font-semibold"
          >
            <span className="text-sm">{label}</span>
          </label>
        )}
        <select
          disabled
          name={name || `select-${route}`}
          className="select select-md w-full select-bordered border-error"
          id={`select-${route}`}
        >
          <option value="">Error loading options</option>
        </select>
      </div>
    );

  return (
    <div className="w-full space-y-2">
      {label && (
        <div className="fieldset-label font-semibold">
          <span className="text-sm">{label}</span>
        </div>
      )}
      <select
        value={currentValue ?? ""}
        onChange={(e) => handleChange(e.target.value)}
        className={`select select-md w-full select-bordered ${error ? "select-error" : ""}`}
        id={`select-${route}`}
        name={name || `select-${route}`}
      >
        <option value="">{placeholder}</option>
        {items.map((item, idx) => render(item, idx))}
      </select>
      {error && (
        <p className="text-error text-sm mt-1">{error.message as string}</p>
      )}
    </div>
  );
}
