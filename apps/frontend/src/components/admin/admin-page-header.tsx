export function AdminPageHeader({
  title,
  description,
}: {
  readonly title: string;
  readonly description?: string;
}): React.ReactElement {
  return (
    <header className="admin-page-header">
      <h1>{title}</h1>
      {description !== undefined ? <p>{description}</p> : null}
    </header>
  );
}
