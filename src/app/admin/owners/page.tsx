import type { Metadata } from "next";
import { isAdmin } from "@/lib/auth";
import { getOwners } from "@/lib/owners";
import AdminLogin from "@/components/admin/AdminLogin";
import AdminOwners from "@/components/admin/AdminOwners";
import Petals from "@/components/Petals";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Owners — Admin" };

export default async function AdminOwnersPage() {
  if (!isAdmin()) return <AdminLogin />;
  const owners = (await getOwners()).map((o) => ({
    id: o.id,
    closet: o.closet,
    name: o.name,
    email: o.email,
    bio: o.bio,
    status: o.status,
    createdAt: o.createdAt,
  }));
  return (
    <>
      <Petals />
      <div className="relative z-10">
        <AdminOwners initial={owners} />
      </div>
    </>
  );
}
