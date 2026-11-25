import type { ReactNode } from "react";

interface AdminPageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
}

export function AdminPageHeader({ title, description, actions }: AdminPageHeaderProps) {
  return (
    <div className="admin-page-heading">
      <div className="min-w-0">
        <p className="admin-page-heading__eyebrow">PAINFIX / MANAGEMENT</p>
        <h1 className="admin-page-heading__title">{title}</h1>
        {description && <p className="admin-page-heading__description">{description}</p>}
      </div>
      {actions && <div className="admin-page-heading__actions">{actions}</div>}
    </div>
  );
}
