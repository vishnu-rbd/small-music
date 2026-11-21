import { useId, type ReactNode } from 'react';

interface PanelProps {
  title: string;
  caption?: ReactNode;
  children: ReactNode;
}

/** A bordered card used for each ranked list and the genre summary. */
export function Panel({ title, caption, children }: PanelProps) {
  const titleId = useId();
  return (
    <section
      role="region"
      aria-labelledby={titleId}
      className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-4"
    >
      <h2 id={titleId} className="text-lg font-semibold text-neutral-100">
        {title}
      </h2>
      {caption ? <p className="mt-1 text-xs text-neutral-400">{caption}</p> : null}
      <div className="mt-3">{children}</div>
    </section>
  );
}

export function PanelMessage({ children }: { children: ReactNode }) {
  return <p className="py-6 text-sm text-neutral-400">{children}</p>;
}
