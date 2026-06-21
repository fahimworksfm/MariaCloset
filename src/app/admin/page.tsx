import type { Metadata } from "next";
import { isAdmin } from "@/lib/auth";
import { getItems } from "@/lib/store";
import AdminLogin from "@/components/admin/AdminLogin";
import AdminDashboard from "@/components/admin/AdminDashboard";
import Petals from "@/components/Petals";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Admin — Maria's Closet" };

export default async function AdminPage() {
  if (!isAdmin()) return <AdminLogin />;
  const items = await getItems();
  return (
    <>
      <Petals />
      <AdminDashboard initialItems={items} />
    </>
  );
}
