import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentOwner } from "@/lib/ownerAuth";
import { getItems } from "@/lib/store";
import { getRequests } from "@/lib/requests";
import Schedule from "@/components/admin/Schedule";
import OwnerNav from "@/components/owner/OwnerNav";
import Petals from "@/components/Petals";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Schedule — My closet" };

export default async function OwnerSchedulePage() {
  const owner = await getCurrentOwner();
  if (!owner) redirect("/owner/login");
  const ids = new Set(
    (await getItems()).filter((i) => (i.closet || "") === owner.closet).map((i) => i.id),
  );
  const requests = (await getRequests()).filter((r) => ids.has(r.itemId));
  return (
    <>
      <Petals />
      <div className="relative z-10">
        <Schedule requests={requests} nav={<OwnerNav active="schedule" closet={owner.closet} />} />
      </div>
    </>
  );
}
