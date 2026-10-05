import type { Metadata } from "next";
import { isAdmin } from "@/lib/auth";
import { loadInsights } from "@/lib/insightsData";
import AdminLogin from "@/components/admin/AdminLogin";
import Insights from "@/components/admin/Insights";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Insights — Maria's Closet" };

export default async function AdminInsightsPage() {
  if (!isAdmin()) return <AdminLogin />;
  const data = await loadInsights();
  return (
    <div className="relative z-10">
      <Insights {...data} />
    </div>
  );
}
