"use client";

import React from "react";
import { WysiwygEditor, type WysiwygEditorProps } from "../WysiwygEditor";

export type MDXEditorFieldProps = WysiwygEditorProps & {
  error?: string;
  required?: boolean;
};

export function MDXEditorField({
  label,
  value,
  onChange,
  placeholder,
  minHeight = "360px",
  className,
  error,
  required,
  disabled,
}: MDXEditorFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-semibold text-base-content flex items-center gap-1">
          {label}
          {required && <span className="text-error">*</span>}
        </label>
      )}
      <WysiwygEditor
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        minHeight={minHeight}
        disabled={disabled}
        className={className}
      />
      {error && <p className="text-xs text-error mt-0.5">{error}</p>}
    </div>
  );
}

export default MDXEditorField;
