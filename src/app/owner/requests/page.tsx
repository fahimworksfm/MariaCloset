import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentOwner } from "@/lib/ownerAuth";
import { getItems } from "@/lib/store";
import { getRequests } from "@/lib/requests";
import { rewardPreviews } from "@/lib/rewards";
import AdminRequests from "@/components/admin/AdminRequests";
import OwnerNav from "@/components/owner/OwnerNav";
import Petals from "@/components/Petals";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Requests — My closet" };

export default async function OwnerRequestsPage() {
  const owner = await getCurrentOwner();
  if (!owner) redirect("/owner/login");
  const ids = new Set(
    (await getItems()).filter((i) => (i.closet || "") === owner.closet).map((i) => i.id),
  );
  const requests = (await getRequests()).filter((r) => ids.has(r.itemId));
  // Only matters if rewards cover every closet (rewardsConfig.scope = "all").
  const previews = await rewardPreviews(requests);
  return (
    <>
      <Petals />
      <div className="relative z-10">
        <AdminRequests
          initial={requests}
          previews={previews}
          endpoint="/api/owner/requests"
          nav={<OwnerNav active="requests" closet={owner.closet} />}
        />
      </div>
    </>
  );
}
