import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Petals from "@/components/Petals";
import OwnerLoginForm from "@/components/owner/OwnerLoginForm";
import { PaisleyDivider } from "@/components/Ornament";
import { getCurrentOwner } from "@/lib/ownerAuth";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Owner login — Maria's Closet" };

export default async function OwnerLoginPage() {
  if (await getCurrentOwner()) redirect("/owner");
  return (
    <>
      <Petals />
      <div className="relative z-10">
        <Navbar />
        <main className="mx-auto max-w-sm px-5 py-14">
          <p className="eyebrow text-center">Closet owners</p>
          <h1 className="mt-2 text-center font-display text-4xl text-gold-shimmer">Welcome back</h1>
          <PaisleyDivider className="mx-auto my-6 h-7 w-36 text-gold/70" />
          <OwnerLoginForm />
        </main>
        <Footer />
      </div>
    </>
  );
}
