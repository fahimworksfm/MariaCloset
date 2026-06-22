import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentOwner } from "@/lib/ownerAuth";
import { getItems } from "@/lib/store";
import { getReviews } from "@/lib/reviews";
import AdminReviews from "@/components/admin/AdminReviews";
import OwnerNav from "@/components/owner/OwnerNav";
import Petals from "@/components/Petals";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Reviews — My closet" };

export default async function OwnerReviewsPage() {
  const owner = await getCurrentOwner();
  if (!owner) redirect("/owner/login");
  const ids = new Set(
    (await getItems()).filter((i) => (i.closet || "") === owner.closet).map((i) => i.id),
  );
  const reviews = (await getReviews()).filter((r) => ids.has(r.itemId));
  return (
    <>
      <Petals />
      <div className="relative z-10">
        <AdminReviews
          initial={reviews}
          endpoint="/api/owner/reviews"
          nav={<OwnerNav active="reviews" closet={owner.closet} />}
        />
      </div>
    </>
  );
}
