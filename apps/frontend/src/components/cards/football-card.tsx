'use client';

import type { CardEntityKind, CardFaceData, CardVariant } from '@draft-io/shared-types';
import { useState } from 'react';

import { CARD_VARIANT_THEMES } from './card-variant-themes';
import { CardFootballIcon } from './card-football-icon';
import { FC_CARD_CLIP_ID, FootballCardSilhouetteDefs } from './card-silhouette';
import { formatCardNameForDisplay } from './format-card-name';
import { formatLeagueIndicator } from './format-league-indicator';

import './cards.css';

export interface FootballCardProps {
  readonly face: CardFaceData;
  readonly variant?: CardVariant;
  readonly entityKind?: CardEntityKind;
  readonly className?: string;
  readonly size?: 'sm' | 'md' | 'lg';
}

export function FootballCard({
  face,
  variant = 'base',
  entityKind = 'player',
  className,
  size = 'md',
}: FootballCardProps): React.ReactElement {
  const theme = CARD_VARIANT_THEMES[variant];
  const nameDisplay = formatCardNameForDisplay(face.displayName);
  const leagueIndicator = formatLeagueIndicator(face.leagueName);
  const [portraitFailed, setPortraitFailed] = useState(false);

  const showPortrait =
    face.imageUrl !== null && face.imageUrl.length > 0 && !portraitFailed;
  const ratingDisplay =
    face.rating !== null ? String(face.rating) : (face.ratingFallback ?? '—');

  const rootClass = [
    'fc-card',
    `fc-card--${variant}`,
    `fc-card--${entityKind}`,
    `fc-card--${size}`,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <article
      className={rootClass}
      style={
        {
          '--fc-primary': theme.primaryColor,
          '--fc-secondary': theme.secondaryColor,
          '--fc-accent': theme.accentColor,
        } as React.CSSProperties
      }
      aria-label={`${face.displayName} ${theme.label} kart`}
    >
      <FootballCardSilhouetteDefs />

      <div className="fc-card__shell">
        <div
          className="fc-card__frame"
          style={{ clipPath: `url(#${FC_CARD_CLIP_ID})` }}
        >
          <div className="fc-card__bevel" aria-hidden="true" />
          <div className="fc-card__satin" aria-hidden="true" />
          <div className="fc-card__pattern" aria-hidden="true" />
          <div className="fc-card__highlight" aria-hidden="true" />
          <div className="fc-card__shine" aria-hidden="true" />
          <div className="fc-card__inner-rim" aria-hidden="true" />

          <div className="fc-card__rating-block">
            <div className="fc-card__rating">{ratingDisplay}</div>
          </div>

          <div className="fc-card__edition">{theme.label.toUpperCase()}</div>

          <div className="fc-card__portrait-wrap">
            <div className="fc-card__portrait-burst" aria-hidden="true" />
            {showPortrait ? (
              <img
                className="fc-card__portrait fc-card__portrait--cutout"
                src={face.imageUrl}
                alt=""
                loading="lazy"
                decoding="async"
                onError={() => {
                  setPortraitFailed(true);
                }}
              />
            ) : (
              <div className="fc-card__portrait fc-card__portrait--placeholder" aria-hidden="true">
                <span className="fc-card__portrait-icon" />
              </div>
            )}
            <div className="fc-card__portrait-vignette" aria-hidden="true" />
          </div>

          <footer className="fc-card__footer">
            <div className="fc-card__identity">
              <div className="fc-card__nameplate">
                {nameDisplay.mode === 'single' ? (
                  <span className="fc-card__name fc-card__name--single">
                    {nameDisplay.singleLine.toUpperCase()}
                  </span>
                ) : (
                  <>
                    {nameDisplay.lines.firstLine.length > 0 ? (
                      <span className="fc-card__name-first">
                        {nameDisplay.lines.firstLine.toUpperCase()}
                      </span>
                    ) : null}
                    <span className="fc-card__name-last">
                      {nameDisplay.lines.secondLine.toUpperCase()}
                    </span>
                  </>
                )}
              </div>

              <div className="fc-card__position">{face.subtitle}</div>
            </div>

            <div className="fc-card__meta">
              <div className="fc-card__meta-side fc-card__meta-side--left">
                <div className="fc-card__flag" title={face.nationalityLabel ?? undefined}>
                  {face.nationalityFlagUrl !== null && face.nationalityFlagUrl.length > 0 ? (
                    <img src={face.nationalityFlagUrl} alt="" loading="lazy" decoding="async" />
                  ) : (
                    <span className="fc-card__flag-placeholder" aria-hidden="true" />
                  )}
                </div>
              </div>

              <div className="fc-card__brand" aria-hidden="true">
                <CardFootballIcon />
              </div>

              <div className="fc-card__meta-side fc-card__meta-side--right">
                <div className="fc-card__league" title={face.leagueName ?? undefined}>
                  {leagueIndicator !== null ? (
                    <span className="fc-card__league-text">{leagueIndicator}</span>
                  ) : (
                    <span className="fc-card__league-placeholder" aria-hidden="true">
                      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect
                          x="5"
                          y="7"
                          width="14"
                          height="10"
                          rx="1.5"
                          stroke="currentColor"
                          strokeWidth="1.5"
                        />
                        <path d="M5 11h14" stroke="currentColor" strokeWidth="1.5" />
                      </svg>
                    </span>
                  )}
                </div>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </article>
  );
}
