import type { ReactNode } from "react";

export default function PageHeader({
  icon,
  eyebrow,
  title,
  subtitle,
}: {
  icon: ReactNode;
  eyebrow: string;
  title: string;
  subtitle: string;
}) {
  return (
    <header className="border-b border-black/10 bg-neutral-50 px-6 py-14 text-center">
      <p className="flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-black/60">
        {icon} {eyebrow}
      </p>
      <h1 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">
        {title}
      </h1>
      <p className="mx-auto mt-4 max-w-md text-sm text-black/70">{subtitle}</p>
    </header>
  );
}
