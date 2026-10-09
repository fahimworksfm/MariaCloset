import type { Metadata } from "next";
import { isAdmin } from "@/lib/auth";
import { getSettings } from "@/lib/settings";
import AdminLogin from "@/components/admin/AdminLogin";
import AdminSettings from "@/components/admin/AdminSettings";
import Petals from "@/components/Petals";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Settings — Admin" };

export default async function AdminSettingsPage() {
  if (!isAdmin()) return <AdminLogin />;
  return (
    <>
      <Petals />
      <AdminSettings initial={await getSettings()} />
    </>
  );
}
