import { AdminPageHeader } from '@/components/admin/admin-page-header';

export default function CardsLoadingPage(): React.ReactElement {
  return (
    <>
      <AdminPageHeader
        title="Kart Şablonu"
        description="Oyuncu ve teknik direktör kartları için premium collectible görünüm önizlemesi."
      />
      <div className="card-preview-grid">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="fc-card fc-card--md" style={{ opacity: 0.2 }} />
        ))}
      </div>
    </>
  );
}
