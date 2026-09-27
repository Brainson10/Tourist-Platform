"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/states";

/** Client-only Leaflet map, loaded on demand so pages without a map ship no map code. */
export const MapPanel = dynamic(() => import("@/components/maps/map-view"), {
  ssr: false,
  loading: () => <Skeleton className="h-80 w-full rounded-2xl" />,
});
