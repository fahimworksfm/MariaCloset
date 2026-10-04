import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentOwner } from "@/lib/ownerAuth";
import { getItems } from "@/lib/store";
import { getLookbookFor } from "@/lib/lookbookStore";
import AdminLookbook from "@/components/admin/AdminLookbook";
import OwnerNav from "@/components/owner/OwnerNav";
import Petals from "@/components/Petals";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Lookbook — My closet" };

export default async function OwnerLookbookPage() {
  const owner = await getCurrentOwner();
  if (!owner) redirect("/owner/login");
  const [entries, items] = await Promise.all([
    getLookbookFor(owner.closet),
    getItems(),
  ]);
  const pieces = items
    .filter((i) => (i.closet || "") === owner.closet)
    .map((i) => ({ id: i.id, name: i.name }));
  return (
    <>
      <Petals />
      <div className="relative z-10">
        <AdminLookbook
          initial={entries}
          pieces={pieces}
          endpoint="/api/owner/lookbook"
          nav={<OwnerNav active="lookbook" closet={owner.closet} />}
        />
      </div>
    </>
  );
}
