'use client';

import { useEffect, useId, useState } from 'react';
import Link from 'next/link';
import PlatformLogo from '../PlatformLogo';
import { PLATFORM } from '../../lib/platform';
import { NAV_LINKS } from '../../lib/landing/content';
import { CtaButton } from './LandingPrimitives';
import { useLandingTheme } from './LandingThemeProvider';

function ThemeToggle() {
  const { theme, toggleTheme } = useLandingTheme();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="landing-theme-toggle"
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Light mode' : 'Dark mode'}
    >
      {isDark ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
          <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.8" />
          <path
            d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M21 14.5A8.5 8.5 0 0 1 9.5 3 7 7 0 1 0 21 14.5Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </button>
  );
}

export default function LandingNavbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { theme } = useLandingTheme();
  const panelId = useId();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 6);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <header className={['landing-nav', scrolled ? 'is-scrolled' : ''].join(' ')}>
      <div className="landing-container landing-nav-inner">
        <Link href="/" className="shrink-0" aria-label={`${PLATFORM.name} home`}>
          <PlatformLogo size="sm" priority onDark={theme === 'dark'} />
        </Link>

        <nav className="landing-nav-links" aria-label="Primary">
          {NAV_LINKS.map((link) => (
            <a key={link.href} href={link.href}>
              {link.label}
            </a>
          ))}
        </nav>

        <div className="landing-nav-actions">
          <ThemeToggle />
          <Link href="/dashboard/login" className="landing-link-quiet hidden sm:inline">
            Login
          </Link>
          <CtaButton href="/signup" className="landing-btn-primary !h-9 !px-3.5 !text-sm">
            Get Started
          </CtaButton>
          <button
            type="button"
            className="landing-menu-btn md:hidden"
            aria-expanded={open}
            aria-controls={panelId}
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? '×' : '☰'}
          </button>
        </div>
      </div>

      {open ? (
        <div id={panelId} className="landing-mobile-panel md:hidden">
          <nav aria-label="Mobile">
            {NAV_LINKS.map((link) => (
              <a key={link.href} href={link.href} onClick={() => setOpen(false)}>
                {link.label}
              </a>
            ))}
            <Link href="/dashboard/login" onClick={() => setOpen(false)} className="sm:hidden">
              Login
            </Link>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
