"use client";

import { useEffect, useState } from "react";
import { hydrateChartStore } from "@/lib/store";
import ChartEditor from "@/components/ChartEditor";

export default function Home() {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    hydrateChartStore().then(() => setHydrated(true));
  }, []);

  if (!hydrated) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center">
        <span className="loading loading-dots loading-lg" />
      </div>
    );
  }

  return <ChartEditor />;
}
