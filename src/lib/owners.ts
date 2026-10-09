// Server-only. Closet owners — emails and password hashes never leave the server.
import { sql, iso, opt } from "@/lib/db";
import type { Owner } from "@/lib/types";

type Row = {
  id: string;
  closet: string;
  name: string;
  email: string;
  password_hash: string;
  bio: string | null;
  status: Owner["status"];
  created_at: Date;
};

const fromRow = (r: Row): Owner => ({
  id: r.id,
  closet: r.closet,
  name: r.name,
  email: r.email,
  passwordHash: r.password_hash,
  bio: opt(r.bio),
  status: r.status,
  createdAt: iso(r.created_at),
});

export async function getOwners(): Promise<Owner[]> {
  return (await sql<Row[]>`select * from owners order by created_at desc`).map(fromRow);
}

export async function getOwnerById(id: string): Promise<Owner | undefined> {
  const [row] = await sql<Row[]>`select * from owners where id = ${id}`;
  return row ? fromRow(row) : undefined;
}

export async function getOwnerByEmail(email: string): Promise<Owner | undefined> {
  const [row] = await sql<Row[]>`select * from owners where lower(email) = ${email.trim().toLowerCase()}`;
  return row ? fromRow(row) : undefined;
}

export async function closetTaken(closet: string): Promise<boolean> {
  const [row] = await sql`select 1 from owners where lower(closet) = ${closet.trim().toLowerCase()}`;
  return !!row;
}

export async function addOwner(owner: Owner): Promise<{ stored: boolean }> {
  try {
    await sql`
      insert into owners (id, closet, name, email, password_hash, bio, status, created_at)
      values (${owner.id}, ${owner.closet}, ${owner.name}, ${owner.email}, ${owner.passwordHash},
              ${owner.bio ?? null}, ${owner.status}, ${owner.createdAt})`;
    return { stored: true };
  } catch (err) {
    console.error("[owners] could not persist:", err);
    return { stored: false };
  }
}

export async function setOwnerStatus(id: string, status: Owner["status"]): Promise<Owner | null> {
  const [row] = await sql<Row[]>`update owners set status = ${status} where id = ${id} returning *`;
  return row ? fromRow(row) : null;
}
