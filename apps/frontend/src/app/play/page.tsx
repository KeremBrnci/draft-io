import Link from 'next/link';

import { PlayGameBackdrop } from '@/components/play/play-game-backdrop';

import './play.css';

export default function PlayPage(): React.ReactElement {
  return (
    <div className="play play--game">
      <PlayGameBackdrop />

      <header className="play-header">
        <Link href="/" className="play-header__brand">
          draft<span>.io</span>
        </Link>
        <Link href="/admin" className="play-header__link">
          Yönetim
        </Link>
      </header>

      <main className="play-main">
        <div className="play-game-hero">
          <div className="play-game-hero__icon" aria-hidden>⚽</div>
          <h1 className="play-title play-title--game">Oyna</h1>
          <p className="play-subtitle">
            Takımını kur, draft yap, mini ligde maçlarını izle. Arkadaşlarınla aynı lobide buluş!
          </p>
        </div>

        <div className="play-actions">
          <Link href="/play/create" className="play-card-link">
            <span className="play-card-link__icon" aria-hidden>🏟️</span>
            <div>
              <h2>Oda Oluştur</h2>
              <p>Odaya isim ver, kodunu arkadaşlarınla paylaş ve sahaya çıkmayı bekle.</p>
            </div>
          </Link>

          <Link href="/play/join" className="play-card-link">
            <span className="play-card-link__icon" aria-hidden>🎮</span>
            <div>
              <h2>Odaya Katıl</h2>
              <p>6 haneli oda kodunu gir ve draft lobisine dal.</p>
            </div>
          </Link>
        </div>
      </main>
    </div>
  );
}
