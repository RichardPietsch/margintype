export function VisualPage({ pageNumber }: { pageNumber: number }) {
  return (
    <div className="page-separator">
      <span>Seite {pageNumber}</span>
    </div>
  );
}
