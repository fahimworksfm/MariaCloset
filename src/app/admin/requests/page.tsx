import type { Metadata } from "next";
import { isAdmin } from "@/lib/auth";
import { getRequests } from "@/lib/requests";
import AdminLogin from "@/components/admin/AdminLogin";
import AdminRequests from "@/components/admin/AdminRequests";
import Petals from "@/components/Petals";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Requests — Admin" };

export default async function AdminRequestsPage() {
  if (!isAdmin()) return <AdminLogin />;
  const requests = await getRequests();
  return (
    <>
      <Petals />
      <div className="relative z-10">
        <AdminRequests initial={requests} />
      </div>
    </>
  );
}
