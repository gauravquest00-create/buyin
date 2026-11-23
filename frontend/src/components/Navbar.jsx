'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import styles from '../styles/site.module.css';

const NAV_ITEMS = [
  { href: '/how-it-works', label: 'How It Works' },
  { href: '/for-professionals', label: 'For Professionals' },
  { href: '/lead-claiming', label: 'Lead Claiming' },
  { href: '/pricing', label: 'Wallet & Pricing' },
  { href: '/faqs', label: 'FAQs' },
  { href: '/contact', label: 'Contact' },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 18);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const isSolid = scrolled || open;

  return (
    <header className={`${styles.navbar} ${isSolid ? styles.navbarScrolled : ''}`}>
      <div className={styles.navInner}>
        <Link href="/" className={styles.brandWrap} onClick={() => setOpen(false)}>
          <span className={styles.brandMark}>B</span>
          <span className={styles.brand}>
            BUY<span>IN</span>
          </span>
        </Link>

        <nav className={styles.navLinks} aria-label="Primary">
          {NAV_ITEMS.map((item) => (
            <Link key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className={styles.navActions}>
          <Link
            href="/login"
            className={isSolid ? styles.btnSecondary : styles.btnGhostDark}
          >
            Login
          </Link>
          <Link href="/get-started" className={styles.btnPrimary}>
            Get Started
          </Link>
        </div>

        <button
          type="button"
          className={styles.menuBtn}
          aria-label="Toggle navigation menu"
          aria-expanded={open}
          onClick={() => setOpen((prev) => !prev)}
        >
          {open ? 'X' : '='}
        </button>
      </div>

      {open && (
        <div className={styles.mobileMenu}>
          <div className={styles.mobileMenuLinks}>
            {NAV_ITEMS.map((item) => (
              <Link key={item.href} href={item.href} onClick={() => setOpen(false)}>
                {item.label}
              </Link>
            ))}
          </div>
          <div className={styles.mobileMenuActions}>
            <Link href="/login" className={styles.btnSecondary} onClick={() => setOpen(false)}>
              Login
            </Link>
            <Link href="/get-started" className={styles.btnPrimary} onClick={() => setOpen(false)}>
              Get Started
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}