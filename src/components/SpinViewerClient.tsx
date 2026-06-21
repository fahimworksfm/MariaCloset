"use client";

import dynamic from "next/dynamic";

const SpinViewer = dynamic(() => import("./SpinViewer"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center">
      <div className="h-12 w-12 animate-spin rounded-full border-2 border-gold/20 border-t-rani" />
    </div>
  ),
});

export default function SpinViewerClient(props: { images: string[]; accent?: string }) {
  return <SpinViewer {...props} />;
}
