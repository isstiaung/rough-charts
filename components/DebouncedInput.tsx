"use client";

import { useEffect, useRef, useState, type InputHTMLAttributes } from "react";

interface Props extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "value" | "onChange"
> {
  value: string;
  onChange: (value: string) => void;
  delay?: number;
}

/**
 * Text input that commits to `onChange` once typing pauses, so the chart
 * doesn't redraw on every keystroke. Leaving the field commits immediately.
 */
export default function DebouncedInput({
  value,
  onChange,
  delay = 300,
  onBlur,
  ...inputProps
}: Props) {
  const [local, setLocal] = useState(value);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const pendingRef = useRef<string | null>(null);

  // An outside change (undo, reset, a shared link) replaces any pending edit
  useEffect(() => {
    clearTimeout(timerRef.current);
    pendingRef.current = null;
    setLocal(value);
  }, [value]);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const flush = () => {
    clearTimeout(timerRef.current);
    if (pendingRef.current !== null) {
      onChange(pendingRef.current);
      pendingRef.current = null;
    }
  };

  return (
    <input
      type="text"
      {...inputProps}
      value={local}
      onChange={(e) => {
        setLocal(e.target.value);
        pendingRef.current = e.target.value;
        clearTimeout(timerRef.current);
        timerRef.current = setTimeout(flush, delay);
      }}
      onBlur={(e) => {
        // Commit before whatever took focus (e.g. Reset) acts on the store
        flush();
        onBlur?.(e);
      }}
    />
  );
}
