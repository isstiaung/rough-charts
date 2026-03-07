"use client";

import { useState, useEffect, useRef } from "react";

interface Props {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  vertical?: boolean;
}

export default function AxisLabelInput({
  value,
  onChange,
  placeholder,
  vertical,
}: Props) {
  const [local, setLocal] = useState(value);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    setLocal(value);
  }, [value]);

  const handleChange = (v: string) => {
    setLocal(v);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => onChange(v), 300);
  };

  if (vertical) {
    return (
      <div className="flex items-center justify-center w-8">
        <input
          type="text"
          value={local}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={placeholder}
          className="input input-bordered input-sm text-center origin-center -rotate-90 w-40"
          style={{ writingMode: "horizontal-tb" }}
        />
      </div>
    );
  }

  return (
    <input
      type="text"
      value={local}
      onChange={(e) => handleChange(e.target.value)}
      placeholder={placeholder}
      className="input input-bordered input-sm w-full text-center"
    />
  );
}
