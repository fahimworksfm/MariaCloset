"use client";

import dynamic from "next/dynamic";

const SpinViewer = dynamic(() => import("./SpinViewer"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-cocoa/20 border-t-emerald" />
    </div>
  ),
});

export default function SpinViewerClient(props: { images: string[]; accent?: string }) {
  return <SpinViewer {...props} />;
}
