import type { Metadata } from "next";
import { isAdmin } from "@/lib/auth";
import { getRequests } from "@/lib/requests";
import AdminLogin from "@/components/admin/AdminLogin";
import Schedule from "@/components/admin/Schedule";
import Petals from "@/components/Petals";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Schedule — Maria's Closet" };

export default async function AdminSchedulePage() {
  if (!isAdmin()) return <AdminLogin />;
  const requests = await getRequests();
  return (
    <>
      <Petals />
      <div className="relative z-10">
        <Schedule requests={requests} />
      </div>
    </>
  );
}
