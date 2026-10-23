import type { ReactNode } from "react";
import PageHeader from "@/components/PageHeader";
import PageNav from "@/components/PageNav";

export const bodyClass = "text-sm leading-7 text-black/70";
export const cardClass =
  "rounded-xl border border-black/10 bg-white p-6 shadow-md";

export type LegalSection = {
  id: string;
  title: string;
  content: ReactNode;
};

export default function LegalPage({
  icon,
  eyebrow,
  title,
  subtitle,
  updated,
  sections,
}: {
  icon: ReactNode;
  eyebrow: string;
  title: string;
  subtitle: string;
  updated?: string;
  sections: LegalSection[];
}) {
  const navItems = sections.map((s) => ({ id: s.id, label: s.title }));

  return (
    <main>
      <PageHeader
        icon={icon}
        eyebrow={eyebrow}
        title={title}
        subtitle={subtitle}
      />

      <div className="lg:pr-[min(21rem,max(0px,calc(1632px-100vw)))]">
        <div className="mx-auto max-w-4xl space-y-12 px-6 py-12">
          {updated && (
            <p className="text-xs text-black/60">Last updated: {updated}</p>
          )}
          {sections.map((s) => (
            <section key={s.id} id={s.id} className="scroll-mt-8">
              <h2 className="text-2xl font-bold">{s.title}</h2>
              <div className="mt-4">{s.content}</div>
            </section>
          ))}
        </div>
      </div>

      <PageNav items={navItems} />
    </main>
  );
}
