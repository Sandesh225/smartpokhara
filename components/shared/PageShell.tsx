import { ReactNode } from "react";
import { Container, Section, PageHeader } from "@/lib/design-system/container";

interface PageShellProps {
  title: string;
  subtitle?: string;
  badge?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  loading?: boolean;
}

export function PageShell({ title, subtitle, badge, actions, children, loading }: PageShellProps) {
  if (loading) return <div className="p-8 space-y-4 animate-pulse">...Skeleton Code...</div>;

  return (
    <div className="min-h-screen bg-background">
      <Container size="wide" spacing="normal">
        <Section spacing="normal">
          <PageHeader title={title} subtitle={subtitle} badge={badge} actions={actions} />
          <div className="mt-6">{children}</div>
        </Section>
      </Container>
    </div>
  );
}