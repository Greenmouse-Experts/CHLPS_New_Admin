import { useQuery } from "@tanstack/react-query";
import { useEffect, useState, type PropsWithChildren } from "react";
import { useFormContext } from "react-hook-form";
import apiClient, { type ApiResponse } from "@/api/simpleApi";

interface SimpleMultiSelectProps<T = any> extends PropsWithChildren {
  route: string;
  value?: string | null;
  onChange?: (value: string | null) => void;
  label?: string;
  name?: string;
  render: (item: T, index: number) => React.ReactNode;
}

export default function SimpleMultiSelect<T = any>(
  props: SimpleMultiSelectProps<T>,
) {
  const { route, value, onChange, label, name, render } = props;

  // SAFE: prevents crash when no FormProvider exists
  let formState: any = null;
  try {
    formState = useFormContext()?.formState;
  } catch {
    formState = null;
  }

  const error = name && formState ? formState.errors?.[name] : undefined;

  const [internalValue, setInternalValue] = useState<string | null>(
    value ?? null,
  );

  const query = useQuery({
    queryKey: ["select", route],
    queryFn: async (): Promise<ApiResponse<T[]>> => {
      const resp = await apiClient.get(route);
      return resp.data as ApiResponse<T[]>;
    },
  });

  useEffect(() => {
    if (value !== undefined && value !== internalValue) {
      setInternalValue(value);
    }
  }, [value]);

  useEffect(() => {
    if (internalValue !== value && onChange) {
      onChange(internalValue);
    }
  }, [internalValue, onChange, value]);

  if (query.isLoading) {
    return (
      <div className="w-full space-y-2">
        {label && (
          <div className="fieldset-label font-semibold">
            <span className="text-sm">{label}</span>
          </div>
        )}
        <div className="skeleton h-10 w-full rounded-lg" />
      </div>
    );
  }

  const raw = query.data?.data as any;
  const items: T[] = Array.isArray(raw)
    ? raw
    : Array.isArray(raw?.data)
      ? raw.data
      : [];

  return (
    <div className="w-full space-y-2">
      {label && (
        <div className="fieldset-label font-semibold">
          <span className="text-sm">{label}</span>
        </div>
      )}
      {items.map((item, idx) => render(item, idx))}
      {error && (
        <p className="text-error text-sm mt-1">{error.message as string}</p>
      )}
    </div>
  );
}
