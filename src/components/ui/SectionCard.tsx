import type { PropsWithChildren, ReactNode } from "react";

type SectionCardProps = PropsWithChildren<{
  title: string;
  description?: string;
  aside?: ReactNode;
}>;

export function SectionCard({
  title,
  description,
  aside,
  children
}: SectionCardProps) {
  return (
    <section className="section-card">
      <header className="section-header">
        <div>
          <h2>{title}</h2>
          {description ? <p>{description}</p> : null}
        </div>
        {aside ? <div>{aside}</div> : null}
      </header>
      {children}
    </section>
  );
}

