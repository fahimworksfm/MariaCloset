import type { Metadata } from "next";
import { isAdmin } from "@/lib/auth";
import { getWaitlist } from "@/lib/waitlist";
import AdminLogin from "@/components/admin/AdminLogin";
import AdminWaitlist from "@/components/admin/AdminWaitlist";
import Petals from "@/components/Petals";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Waitlist — Admin" };

export default async function AdminWaitlistPage() {
  if (!isAdmin()) return <AdminLogin />;
  const waitlist = await getWaitlist();
  return (
    <>
      <Petals />
      <div className="relative z-10">
        <AdminWaitlist initial={waitlist} />
      </div>
    </>
  );
}
