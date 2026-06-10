import Link from 'next/link';

import './home.css';

const FEATURES = [
  {
    title: 'Oyuncu Tarayıcı',
    description: 'Piyasa değeri, kulüp ve mevki verileriyle içe aktarılan oyuncuları arayın ve filtreleyin.',
    href: '/admin/players',
  },
  {
    title: 'Veri Kalitesi',
    description: 'Reyting veya kart üretiminden önce eksik alanları ve dağılımları inceleyin.',
    href: '/admin/data-quality',
  },
] as const;

export default function HomePage(): React.ReactElement {
  return (
    <div className="home">
      <header className="home-header">
        <div className="home-header__brand">
          draft<span>.io</span>
        </div>
        <Link href="/admin" className="home-header__cta">
          Yönetime Git
        </Link>
      </header>

      <section className="home-hero">
        <span className="home-hero__eyebrow">Futbol draft platformu</span>
        <h1>Gerçek futbol verisiyle kadronu kur</h1>
        <p>
          Arkadaşlarınla oda kur, koda katıl ve draft oyununa hazırlan. Lig kadrolarını yönetim
          panelinden inceleyebilirsin.
        </p>
        <div className="home-hero__actions">
          <Link href="/play" className="home-btn home-btn--primary">
            Oyna
          </Link>
          <Link href="/admin" className="home-btn home-btn--secondary">
            Yönetim Paneli
          </Link>
        </div>
      </section>

      <section className="home-features">
        {FEATURES.map((feature) => (
          <Link key={feature.href} href={feature.href} className="home-feature" style={{ textDecoration: 'none' }}>
            <h3>{feature.title}</h3>
            <p>{feature.description}</p>
          </Link>
        ))}
      </section>

      <footer className="home-footer">
        draft.io — veri inceleme ve kalite için dahili yönetim araçları
      </footer>
    </div>
  );
}
