import type { Metadata } from "next";
import { isAdmin } from "@/lib/auth";
import { getReviews } from "@/lib/reviews";
import AdminLogin from "@/components/admin/AdminLogin";
import AdminReviews from "@/components/admin/AdminReviews";
import Petals from "@/components/Petals";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Reviews — Admin" };

export default async function AdminReviewsPage() {
  if (!isAdmin()) return <AdminLogin />;
  const reviews = await getReviews();
  return (
    <>
      <Petals />
      <div className="relative z-10">
        <AdminReviews initial={reviews} />
      </div>
    </>
  );
}
