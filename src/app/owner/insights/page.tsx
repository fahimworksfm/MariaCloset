import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentOwner } from "@/lib/ownerAuth";
import { loadInsights } from "@/lib/insightsData";
import Insights from "@/components/admin/Insights";
import OwnerNav from "@/components/owner/OwnerNav";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Insights — My closet" };

export default async function OwnerInsightsPage() {
  const owner = await getCurrentOwner();
  if (!owner) redirect("/owner/login");
  const data = await loadInsights((i) => (i.closet || "") === owner.closet);
  return (
    <div className="relative z-10">
      <Insights
        {...data}
        subtitle="How your pieces are doing."
        nav={<OwnerNav active="insights" closet={owner.closet} />}
      />
    </div>
  );
}
