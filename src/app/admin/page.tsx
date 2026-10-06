import type { Metadata } from "next";
import { isAdmin } from "@/lib/auth";
import { getItems } from "@/lib/store";
import { getAiStatus } from "@/lib/ai";
import AdminLogin from "@/components/admin/AdminLogin";
import AdminDashboard from "@/components/admin/AdminDashboard";
import Petals from "@/components/Petals";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Admin — Maria's Closet" };

export default async function AdminPage() {
  if (!isAdmin()) return <AdminLogin />;
  const [items, aiStatus] = await Promise.all([getItems(), getAiStatus()]);
  return (
    <>
      <Petals />
      <AdminDashboard initialItems={items} aiStatus={aiStatus} />
    </>
  );
}
