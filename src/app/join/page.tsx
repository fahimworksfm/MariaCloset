import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ImageBand from "@/components/ImageBand";
import JoinForm from "@/components/owner/JoinForm";

export const metadata: Metadata = { title: "Open a closet — Maria's Closet" };

export default function JoinPage() {
  return (
    <div className="relative z-10">
      <Navbar />
      <ImageBand
        src="/brand/closet-rail.jpg"
        alt="A rail of garments in soft light"
        eyebrow="Open it to friends"
        title="Open your closet"
        subtitle="Apply to list your own pieces alongside Maria's. Once approved, you'll manage your closet from your own dashboard."
        as="h1"
        heightClass="h-[46vh] min-h-[320px]"
        priority
      />
      <main className="mx-auto max-w-lg px-5 py-14">
        <JoinForm />
      </main>
      <Footer />
    </div>
  );
}
