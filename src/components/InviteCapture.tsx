"use client";

import { useEffect } from "react";
import { captureInvite } from "@/lib/invite";

/** Mounted once in the root layout: remembers ?ref= from whatever page a visitor lands on. */
export default function InviteCapture() {
  useEffect(() => {
    captureInvite(window.location.search);
  }, []);
  return null;
}
