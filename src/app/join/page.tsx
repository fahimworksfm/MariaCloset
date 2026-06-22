import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Petals from "@/components/Petals";
import JoinForm from "@/components/owner/JoinForm";
import { PaisleyDivider } from "@/components/Ornament";

export const metadata: Metadata = { title: "Open a closet — Maria's Closet" };

export default function JoinPage() {
  return (
    <>
      <Petals />
      <div className="relative z-10">
        <Navbar />
        <main className="mx-auto max-w-lg px-5 py-12">
          <p className="eyebrow text-center">Open it to friends</p>
          <h1 className="mt-2 text-center font-display text-5xl text-gold-shimmer">
            Open your closet
          </h1>
          <PaisleyDivider className="mx-auto my-6 h-7 w-40 text-gold/70" />
          <p className="mx-auto mb-7 max-w-md text-center text-cream/65">
            Apply to list your own pieces alongside Maria&apos;s. Once approved, you&apos;ll manage
            your closet from your own dashboard.
          </p>
          <JoinForm />
        </main>
        <Footer />
      </div>
    </>
  );
}
