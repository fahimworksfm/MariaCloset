"use client";

import { useEffect } from "react";
import { recent } from "@/lib/clientStore";

/** Records an item as recently-viewed (client-side only). */
export default function RecordView({ itemId }: { itemId: string }) {
  useEffect(() => {
    recent.push(itemId);
  }, [itemId]);
  return null;
}
