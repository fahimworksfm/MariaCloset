import type { Metadata } from "next";
import { isAdmin } from "@/lib/auth";
import { getRequests } from "@/lib/requests";
import { rewardPreviews } from "@/lib/rewards";
import AdminLogin from "@/components/admin/AdminLogin";
import AdminRequests from "@/components/admin/AdminRequests";
import Petals from "@/components/Petals";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Requests — Admin" };

export default async function AdminRequestsPage() {
  if (!isAdmin()) return <AdminLogin />;
  const requests = await getRequests();
  const previews = await rewardPreviews(requests);
  return (
    <>
      <Petals />
      <div className="relative z-10">
        <AdminRequests initial={requests} previews={previews} />
      </div>
    </>
  );
}
