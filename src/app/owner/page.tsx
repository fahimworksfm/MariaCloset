import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentOwner } from "@/lib/ownerAuth";
import { getItems } from "@/lib/store";
import OwnerDashboard from "@/components/owner/OwnerDashboard";
import Petals from "@/components/Petals";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "My closet — Maria's Closet" };

export default async function OwnerPage() {
  const owner = await getCurrentOwner();
  if (!owner) redirect("/owner/login");
  const items = (await getItems()).filter((i) => (i.closet || "") === owner.closet);
  return (
    <>
      <Petals />
      <div className="relative z-10">
        <OwnerDashboard closet={owner.closet} ownerName={owner.name} initialItems={items} />
      </div>
    </>
  );
}
