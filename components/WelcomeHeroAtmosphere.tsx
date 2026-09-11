'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Atmosfera hero senza WebGL: SVG + CSS.
 * Evita il bug di compositing dove il canvas GPU copre l’HTML.
 */
export default function WelcomeHeroAtmosphere() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [calm, setCalm] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const coarse = window.matchMedia('(pointer: coarse)');
    const sync = () => setCalm(mq.matches || coarse.matches);
    sync();
    mq.addEventListener('change', sync);
    coarse.addEventListener('change', sync);
    return () => {
      mq.removeEventListener('change', sync);
      coarse.removeEventListener('change', sync);
    };
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || calm) return;

    const onMove = (e: PointerEvent) => {
      const rect = root.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;
      const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
      root.style.setProperty('--px', x.toFixed(3));
      root.style.setProperty('--py', y.toFixed(3));
    };

    const parent = root.parentElement ?? root;
    parent.addEventListener('pointermove', onMove, { passive: true });
    return () => parent.removeEventListener('pointermove', onMove);
  }, [calm]);

  return (
    <div
      ref={rootRef}
      className="hero-atmosphere absolute inset-0 overflow-hidden"
      style={{ ['--px' as string]: 0, ['--py' as string]: 0 }}
      aria-hidden
    >
      <style jsx>{`
        .hero-atmosphere {
          background: linear-gradient(180deg, #c5d9e8 0%, #e4efe9 42%, #d5e4dc 72%, #9ebfb4 100%);
        }

        .hero-atmosphere .layer {
          will-change: transform;
          transform: translate3d(
            calc(var(--px, 0) * var(--shift-x, 0px)),
            calc(var(--py, 0) * var(--shift-y, 0px)),
            0
          );
          transition: transform 0.45s ease-out;
        }

        .hero-atmosphere .sun {
          animation: hero-sun 48s ease-in-out infinite alternate;
        }

        .hero-atmosphere .sun-core {
          box-shadow:
            0 0 0 2px rgba(15, 107, 102, 0.22),
            0 0 28px 8px rgba(126, 176, 171, 0.45),
            0 0 64px 20px rgba(158, 182, 212, 0.35);
          animation: hero-sun-pulse 10s ease-in-out infinite;
        }

        .hero-atmosphere .drift {
          animation: hero-drift 28s ease-in-out infinite alternate;
        }

        .hero-atmosphere .drift-slow {
          animation: hero-drift-slow 36s ease-in-out infinite alternate;
        }

        .hero-atmosphere .water {
          animation: hero-water 7s ease-in-out infinite;
        }

        @keyframes hero-sun {
          from {
            transform: translate3d(
              calc(var(--px, 0) * var(--shift-x, 0px) - 8vw),
              calc(var(--py, 0) * var(--shift-y, 0px) + 18vh),
              0
            );
          }
          to {
            transform: translate3d(
              calc(var(--px, 0) * var(--shift-x, 0px) + 46vw),
              calc(var(--py, 0) * var(--shift-y, 0px) - 22vh),
              0
            );
          }
        }

        @keyframes hero-sun-pulse {
          0%,
          100% {
            box-shadow:
              0 0 0 2px rgba(15, 107, 102, 0.22),
              0 0 28px 8px rgba(126, 176, 171, 0.45),
              0 0 64px 20px rgba(158, 182, 212, 0.35);
          }
          50% {
            box-shadow:
              0 0 0 2px rgba(15, 107, 102, 0.3),
              0 0 36px 12px rgba(126, 176, 171, 0.55),
              0 0 80px 28px rgba(158, 182, 212, 0.42);
          }
        }

        @keyframes hero-drift {
          from {
            transform: translate3d(calc(var(--px, 0) * var(--shift-x, 0px) - 1.2%), calc(var(--py, 0) * var(--shift-y, 0px)), 0);
          }
          to {
            transform: translate3d(calc(var(--px, 0) * var(--shift-x, 0px) + 1.2%), calc(var(--py, 0) * var(--shift-y, 0px)), 0);
          }
        }

        @keyframes hero-drift-slow {
          from {
            transform: translate3d(calc(var(--px, 0) * var(--shift-x, 0px) + 0.8%), calc(var(--py, 0) * var(--shift-y, 0px)), 0) scale(1.02);
          }
          to {
            transform: translate3d(calc(var(--px, 0) * var(--shift-x, 0px) - 0.8%), calc(var(--py, 0) * var(--shift-y, 0px)), 0) scale(1.02);
          }
        }

        @keyframes hero-water {
          0%,
          100% {
            opacity: 0.38;
            transform: translateY(0);
          }
          50% {
            opacity: 0.5;
            transform: translateY(-2px);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .hero-atmosphere .sun,
          .hero-atmosphere .sun-core,
          .hero-atmosphere .drift,
          .hero-atmosphere .drift-slow,
          .hero-atmosphere .water {
            animation: none;
          }
        }
      `}</style>

      {/* Sole grafico: disco netto + alone teal, sorge da sinistra */}
      <div
        className="layer sun"
        style={{ ['--shift-x' as string]: '14px', ['--shift-y' as string]: '10px' }}
      >
        <div className="absolute left-[10%] top-[36%] h-24 w-24 rounded-full bg-[#7eb0ab]/35 blur-2xl sm:h-32 sm:w-32" />
        <div className="sun-core absolute left-[14%] top-[40%] h-11 w-11 rounded-full bg-[#eef6f4] sm:h-14 sm:w-14" />
      </div>

      {/* Far ridges */}
      <svg
        className="layer drift-slow absolute inset-x-[-4%] bottom-[18%] h-[55%] w-[108%]"
        style={{ ['--shift-x' as string]: '18px', ['--shift-y' as string]: '8px' }}
        viewBox="0 0 1200 420"
        preserveAspectRatio="xMidYMax slice"
      >
        <path
          fill="#7fa89a"
          d="M0 280 C120 220 180 250 280 210 C380 170 430 200 520 180 C640 150 700 190 820 160 C940 130 1020 170 1200 140 L1200 420 L0 420 Z"
        />
        <path
          fill="#5f8f7f"
          opacity="0.85"
          d="M0 320 C140 270 220 300 340 260 C460 220 520 255 640 235 C780 210 860 250 980 220 C1080 198 1140 230 1200 210 L1200 420 L0 420 Z"
        />
      </svg>

      {/* Mid hills */}
      <svg
        className="layer drift absolute inset-x-[-3%] bottom-[8%] h-[48%] w-[106%]"
        style={{ ['--shift-x' as string]: '28px', ['--shift-y' as string]: '10px' }}
        viewBox="0 0 1200 360"
        preserveAspectRatio="xMidYMax slice"
      >
        <path
          fill="#3d6a5f"
          d="M0 210 C90 170 160 195 250 165 C360 125 420 160 530 145 C650 128 720 165 840 140 C960 115 1060 145 1200 120 L1200 360 L0 360 Z"
        />
        <path
          fill="#2c4f47"
          d="M0 260 C130 230 200 250 320 225 C450 195 520 230 650 215 C800 195 880 230 1000 210 C1100 196 1150 220 1200 205 L1200 360 L0 360 Z"
        />
      </svg>

      {/* Near ground + water sheen */}
      <svg
        className="layer absolute inset-x-0 bottom-0 h-[36%] w-full"
        style={{ ['--shift-x' as string]: '8px', ['--shift-y' as string]: '4px' }}
        viewBox="0 0 1200 260"
        preserveAspectRatio="none"
      >
        <path fill="#1a3330" d="M0 90 C200 60 400 110 600 80 C800 50 1000 95 1200 70 L1200 260 L0 260 Z" />
        <path
          className="water"
          fill="#7eb0ab"
          d="M0 140 C180 120 320 150 480 130 C680 105 820 145 1000 125 C1100 115 1160 130 1200 128 L1200 260 L0 260 Z"
        />
      </svg>

      {/* Mist */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_35%,rgba(213,227,220,0.35)_100%)]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[#d5e3dc]/50 to-transparent" />
    </div>
  );
}
