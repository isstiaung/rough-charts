"use client";

import { useEffect, useState } from "react";
import { buildShareUrl } from "@/lib/share";
import { pickSnapshot } from "@/lib/snapshot";
import { useChartStore } from "@/lib/store";

/** Some chat apps and email clients cut off longer URLs */
const LONG_URL_LENGTH = 8000;

type Status = { kind: "success" | "error"; message: string } | null;

export default function ShareButton() {
  const [status, setStatus] = useState<Status>(null);

  useEffect(() => {
    if (!status) return;
    const timer = setTimeout(() => setStatus(null), 4000);
    return () => clearTimeout(timer);
  }, [status]);

  const copyLink = async () => {
    let url: string;
    try {
      url = await buildShareUrl(
        pickSnapshot(useChartStore.getState()),
        window.location
      );
    } catch (err) {
      console.error("Share link failed:", err);
      setStatus({ kind: "error", message: "Couldn't create a link." });
      return;
    }

    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // Clipboard access denied (e.g. insecure context); let the user copy it
      window.prompt("Copy this link:", url);
      return;
    }
    setStatus({
      kind: "success",
      message:
        url.length > LONG_URL_LENGTH
          ? "Link copied. It's long, so some apps may cut it off."
          : "Link copied. Anyone with it sees this chart.",
    });
  };

  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        onClick={copyLink}
        className="btn btn-sm btn-outline w-full"
        title="Copy a link that opens this chart. The data lives in the link itself."
      >
        🔗 Copy Share Link
      </button>
      {status && (
        <p
          role={status.kind === "error" ? "alert" : "status"}
          className={`text-xs ${status.kind === "error" ? "text-error" : "text-base-content/70"}`}
        >
          {status.message}
        </p>
      )}
    </div>
  );
}
