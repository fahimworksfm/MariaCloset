import { siteConfig } from "@/data/config";
import { getSettings } from "@/lib/settings";

export default async function Footer() {
  const { site } = await getSettings();
  return (
    <footer className="mt-24 border-t border-line">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-5 py-10 sm:px-8 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="font-display text-2xl text-zari">{siteConfig.name}</p>
          <p className="mt-2 text-sm text-mute">{site.tagline}</p>
        </div>
        <div className="flex flex-wrap gap-x-7 gap-y-1 text-sm text-cream">
          <a href="/browse" className="py-2 transition hover:text-brass">Browse</a>
          <a href="/closets" className="py-2 transition hover:text-brass">Closets</a>
          <a href="/membership" className="py-2 transition hover:text-brass">Membership &amp; gifts</a>
          <a href="/refer" className="py-2 transition hover:text-brass">Invite a friend</a>
          <a href="/join" className="py-2 transition hover:text-brass">Open a closet</a>
          <a href="/admin" className="py-2 text-mute transition hover:text-cream">Manage</a>
        </div>
      </div>
    </footer>
  );
}
