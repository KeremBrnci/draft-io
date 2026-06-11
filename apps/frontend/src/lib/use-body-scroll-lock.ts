'use client';

import { useEffect } from 'react';

const HTML_CLASS = 'app-overlay-open';
const BODY_CLASS = 'app-overlay-open';

export function useBodyScrollLock(active: boolean): void {
  useEffect(() => {
    if (!active || typeof document === 'undefined') {
      return;
    }

    const html = document.documentElement;
    const body = document.body;
    const scrollY = window.scrollY;

    html.classList.add(HTML_CLASS);
    body.classList.add(BODY_CLASS);
    body.dataset.scrollLockY = String(scrollY);

    return () => {
      html.classList.remove(HTML_CLASS);
      body.classList.remove(BODY_CLASS);
      const lockedY = Number(body.dataset.scrollLockY ?? '0');
      delete body.dataset.scrollLockY;
      window.scrollTo(0, lockedY);
    };
  }, [active]);
}
