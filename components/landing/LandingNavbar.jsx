'use client';

import { useEffect, useId, useState } from 'react';
import Link from 'next/link';
import BrandLogo from '../BrandLogo';
import { PLATFORM } from '../../lib/platform';
import { NAV_LINKS } from '../../lib/landing/content';
import { CtaButton } from './LandingPrimitives';

export default function LandingNavbar() {
  const [open, setOpen] = useState(false);
  const panelId = useId();

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
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[hsl(var(--navy-dark))/0.92] backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link href="/" className="shrink-0" aria-label={`${PLATFORM.name} home`}>
          <BrandLogo size="sm" branding={PLATFORM.branding} variant="dark" />
        </Link>

        <nav className="hidden items-center gap-6 lg:flex" aria-label="Primary">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href + link.label}
              href={link.href}
              className="text-sm font-medium text-white/70 transition hover:text-white"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-2 sm:flex">
          <Link
            href="/dashboard/login"
            className="dash-btn dash-btn-ghost dash-btn-sm !text-white/80 hover:!bg-white/10 hover:!text-white"
          >
            Login
          </Link>
          <CtaButton href="/signup" className="!px-4 !py-2 !text-sm">
            Get Started
          </CtaButton>
        </div>

        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/15 text-white lg:hidden"
          aria-expanded={open}
          aria-controls={panelId}
          aria-label={open ? 'Close menu' : 'Open menu'}
          onClick={() => setOpen((v) => !v)}
        >
          <span aria-hidden className="text-lg leading-none">
            {open ? '×' : '☰'}
          </span>
        </button>
      </div>

      {open ? (
        <div
          id={panelId}
          className="border-t border-white/10 bg-[hsl(var(--navy-dark))] px-4 py-4 lg:hidden"
        >
          <nav className="flex flex-col gap-1" aria-label="Mobile">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href + link.label}
                href={link.href}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-white/80 hover:bg-white/5"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </a>
            ))}
          </nav>
          <div className="mt-4 flex flex-col gap-2">
            <Link
              href="/dashboard/login"
              className="dash-btn dash-btn-secondary dash-btn-md w-full justify-center"
              onClick={() => setOpen(false)}
            >
              Login
            </Link>
            <CtaButton href="/signup" className="w-full justify-center">
              Get Started
            </CtaButton>
          </div>
        </div>
      ) : null}
    </header>
  );
}
