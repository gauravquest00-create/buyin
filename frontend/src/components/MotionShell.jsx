'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';

export function MotionShell({ children }) {
  const pathname = usePathname();
  const rootRef = useRef(null);
  const firstLoadRef = useRef(true);
  const [barKey, setBarKey] = useState(0);
  const [showBar, setShowBar] = useState(false);

  useEffect(() => {
    if (firstLoadRef.current) {
      firstLoadRef.current = false;
      return undefined;
    }

    setBarKey((prev) => prev + 1);
    setShowBar(true);

    const timer = setTimeout(() => {
      setShowBar(false);
    }, 560);

    return () => clearTimeout(timer);
  }, [pathname]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;

    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const sections = Array.from(root.querySelectorAll('section'));
    const targets = [];

    sections.forEach((section, idx) => {
      if (idx === 0) return;
      targets.push(section);

      const cards = section.querySelectorAll('article, table, form');
      cards.forEach((el) => targets.push(el));
    });

    if (prefersReduced || typeof IntersectionObserver === 'undefined') {
      targets.forEach((el) => {
        el.setAttribute('data-scroll-zoom', 'visible');
      });
      return undefined;
    }

    const reveal = (el, delayMs) => {
      if (delayMs > 0) {
        el.style.transitionDelay = `${delayMs}ms`;
      }
      el.setAttribute('data-scroll-zoom', 'visible');
    };

    const observer = new IntersectionObserver(
      (entries) => {
        let batchIndex = 0;
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            reveal(entry.target, Math.min(batchIndex * 60, 180));
            batchIndex += 1;
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.08,
        rootMargin: '0px 0px -36px 0px',
      }
    );

    targets.forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.92) {
        el.setAttribute('data-scroll-zoom', 'visible');
      } else {
        el.setAttribute('data-scroll-zoom', 'pending');
        observer.observe(el);
      }
    });

    return () => {
      observer.disconnect();
    };
  }, [pathname]);

  return (
    <>
      {showBar && <div key={barKey} className="page-progress-bar" aria-hidden="true" />}
      <div key={pathname} ref={rootRef} className="page-smooth-enter">
        {children}
      </div>
    </>
  );
}