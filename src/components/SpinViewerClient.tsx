"use client";

import dynamic from "next/dynamic";

const SpinViewer = dynamic(() => import("./SpinViewer"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center p-8">
      <div className="skeleton-shimmer h-full max-h-[440px] w-[70%] max-w-[280px] border border-line" />
    </div>
  ),
});

export default function SpinViewerClient(props: { images: string[]; accent?: string }) {
  return <SpinViewer {...props} />;
}
