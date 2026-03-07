"use client";

import { useState, useEffect, useRef } from "react";
import { useChartStore } from "@/lib/store";

export default function TitleInput() {
  const title = useChartStore((s) => s.title);
  const setTitle = useChartStore((s) => s.setTitle);
  const [local, setLocal] = useState(title);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    setLocal(title);
  }, [title]);

  const handleChange = (value: string) => {
    setLocal(value);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setTitle(value), 300);
  };

  return (
    <input
      type="text"
      value={local}
      onChange={(e) => handleChange(e.target.value)}
      placeholder="Chart Title"
      className="input input-bordered w-full text-center text-lg font-bold"
    />
  );
}
