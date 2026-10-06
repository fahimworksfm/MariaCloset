import type { Metadata } from "next";
import { isAdmin } from "@/lib/auth";
import { getRequests } from "@/lib/requests";
import { getCredits, getReferrals, tierFor } from "@/lib/rewards";
import { normContact } from "@/lib/requestMath";
import { money, rewardsConfig } from "@/data/config";
import AdminLogin from "@/components/admin/AdminLogin";
import AdminNav from "@/components/admin/AdminNav";
import { StatTile } from "@/components/admin/Insights";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Rewards — Admin" };

type Member = {
  key: string;
  name: string;
  code?: string;
  rentals: number;
  tier: string;
  credit: number;
  converted: number;
};

export default async function AdminRewardsPage() {
  if (!isAdmin()) return <AdminLogin />;
  const [referrals, credits, requests] = await Promise.all([getReferrals(), getCredits(), getRequests()]);

  // Everyone in the programme: invite-code holders, renters with confirmed
  // rentals, and anyone with credit movements — keyed by normalised contact.
  const members = new Map<string, Member>();
  const touch = (key: string, name: string) => {
    let m = members.get(key);
    if (!m) members.set(key, (m = { key, name, rentals: 0, tier: "", credit: 0, converted: 0 }));
    if (m.name === "—" && name) m.name = name;
    return m;
  };
  for (const r of referrals) touch(r.contact, r.name).code = r.code;
  for (const q of requests) {
    if (q.status === "approved") touch(normContact(q.contact), q.renterName.split(" ")[0]).rentals++;
  }
  for (const c of credits) {
    const m = touch(c.contact, "—");
    m.credit += c.amount;
    if (c.amount > 0) m.converted++;
  }
  const list = Array.from(members.values())
    .map((m) => ({ ...m, tier: tierFor(m.rentals).name }))
    .sort((a, b) => b.credit - a.credit || b.rentals - a.rentals || a.name.localeCompare(b.name));

  const converted = list.reduce((s, m) => s + m.converted, 0);
  const outstanding = list.reduce((s, m) => s + Math.max(0, m.credit), 0);
  const discounts = requests
    .filter((r) => r.status === "approved")
    .reduce((s, r) => s + (r.adjustments ?? []).reduce((t, a) => t + a.amount, 0), 0);

  return (
    <div className="relative z-10">
      <main className="mx-auto max-w-5xl px-5 py-8">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-4xl text-gold-shimmer">Rewards</h1>
            <p className="text-sm text-cream/60">
              Invites, credit and loyalty tiers.{" "}
              {rewardsConfig.enabled
                ? `Applied automatically when you approve a request${
                    rewardsConfig.scope === "maria" ? " for one of your pieces" : ""
                  }.`
                : "The programme is switched off."}
            </p>
          </div>
          <AdminNav active="rewards" />
        </header>

        <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatTile label="People in the programme" value={String(list.length)} />
          <StatTile label="Invites converted" value={String(converted)} sub="Friends whose first rental was confirmed" />
          <StatTile label="Credit outstanding" value={money(outstanding)} sub="Owed to inviters, not yet used" />
          <StatTile label="Discounts given" value={money(discounts)} sub="Tiers, welcome offers and credit" />
        </div>

        <section className="panel mt-6 p-5 sm:p-6">
          <h2 className="text-sm font-medium text-cream">Members</h2>
          <p className="text-xs text-cream/50">
            Matched by the email or phone they rent with. Tiers:{" "}
            {rewardsConfig.tiers
              .map((t) => `${t.name} ${t.minRentals}+${t.discountPct ? ` (${t.discountPct}% off)` : ""}`)
              .join(" · ")}
            .
          </p>
          {list.length === 0 ? (
            <p className="py-12 text-center text-sm text-cream/45">
              No one yet. Members appear once someone gets an invite link or a rental is confirmed.
            </p>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[640px] text-sm">
                <thead>
                  <tr className="text-xs text-cream/45">
                    <th className="py-2 text-left font-normal">Member</th>
                    <th className="py-2 text-left font-normal">Invite code</th>
                    <th className="py-2 text-right font-normal">Rentals</th>
                    <th className="py-2 text-left font-normal pl-6">Tier</th>
                    <th className="py-2 text-right font-normal">Invites</th>
                    <th className="py-2 text-right font-normal">Credit</th>
                  </tr>
                </thead>
                <tbody>
                  {list.map((m) => (
                    <tr key={m.key} className="border-t border-cream/[0.06]">
                      <td className="py-2.5 pr-4">
                        <div className="text-cream/85">{m.name}</div>
                        <div className="text-xs text-cream/40">{m.key}</div>
                      </td>
                      <td className="py-2.5 font-mono text-xs tracking-wider text-cream/60">{m.code ?? "—"}</td>
                      <td className="py-2.5 text-right tabular-nums text-cream/70">{m.rentals}</td>
                      <td className="py-2.5 pl-6 text-cream/70">{m.tier}</td>
                      <td className="py-2.5 text-right tabular-nums text-cream/70">{m.converted}</td>
                      <td className="py-2.5 text-right tabular-nums text-cream">{money(Math.max(0, m.credit))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
