"use client";

import { useEffect, useState } from "react";
import { decodeChart, readSharedChartParam } from "@/lib/share";
import { defaultSnapshot, redo, undo, useChartStore } from "@/lib/store";

const NON_TEXT_INPUTS = ["range", "checkbox", "radio", "button", "file"];

/** Fields with their own native undo, which shortcuts must not hijack */
export function isTextField(el: EventTarget | null): boolean {
  if (el instanceof HTMLTextAreaElement) return true;
  if (el instanceof HTMLInputElement) return !NON_TEXT_INPUTS.includes(el.type);
  return el instanceof HTMLElement && el.isContentEditable;
}

/** Cmd/Ctrl+Z undoes, Shift+Cmd/Ctrl+Z or Ctrl+Y redoes. */
export function useUndoShortcuts() {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (!(e.metaKey || e.ctrlKey) || e.altKey || isTextField(e.target)) {
        return;
      }
      const key = e.key.toLowerCase();
      if (key === "z") {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
      } else if (key === "y" && !e.shiftKey) {
        e.preventDefault();
        redo();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);
}

export type SharedLinkStatus = "loaded" | "invalid" | null;

/**
 * Opens a chart from a share link (#chart=...) on load or when the hash
 * changes. Loading is a regular, undoable edit.
 */
export function useSharedChartLink() {
  const loadSnapshot = useChartStore((s) => s.loadSnapshot);
  const [status, setStatus] = useState<SharedLinkStatus>(null);

  useEffect(() => {
    const load = async () => {
      const encoded = readSharedChartParam(window.location.hash);
      if (encoded === null) return;
      // Drop the hash so a reload doesn't replace later edits with the link
      history.replaceState(
        null,
        "",
        window.location.pathname + window.location.search
      );
      const snapshot = await decodeChart(encoded, defaultSnapshot);
      if (snapshot) loadSnapshot(snapshot);
      setStatus(snapshot ? "loaded" : "invalid");
    };
    load();
    window.addEventListener("hashchange", load);
    return () => window.removeEventListener("hashchange", load);
  }, [loadSnapshot]);

  return [status, () => setStatus(null)] as const;
}
