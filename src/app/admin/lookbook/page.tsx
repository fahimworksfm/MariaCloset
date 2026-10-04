import type { Metadata } from "next";
import { isAdmin } from "@/lib/auth";
import { getLookbook } from "@/lib/lookbookStore";
import { getItems } from "@/lib/store";
import AdminLogin from "@/components/admin/AdminLogin";
import AdminLookbook from "@/components/admin/AdminLookbook";
import Petals from "@/components/Petals";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Lookbook — Maria's Closet" };

export default async function AdminLookbookPage() {
  if (!isAdmin()) return <AdminLogin />;
  const [entries, items] = await Promise.all([getLookbook(), getItems()]);
  const pieces = items.map((i) => ({ id: i.id, name: i.name }));
  return (
    <>
      <Petals />
      <AdminLookbook initial={entries} pieces={pieces} />
    </>
  );
}
