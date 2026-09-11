'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, BadgeCheck, Shield, Users } from 'lucide-react';
import Logo from '@/components/Logo';
import WelcomeHeroAtmosphere from '@/components/WelcomeHeroAtmosphere';

const APP_HREF = '/decisioni?c=ai-ethics';
const LOGIN_HREF = `/auth/login?callbackUrl=${encodeURIComponent(APP_HREF)}`;

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.08 * i, duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  }),
};

export default function WelcomePage() {
  return (
    <div className="welcome-page min-h-full bg-[var(--w-bg)] text-[var(--w-ink)]">
      <style jsx global>{`
        .welcome-page {
          --w-bg: #eef3f1;
          --w-ink: #10201e;
          --w-muted: #5a6e6a;
          --w-accent: #0f6b66;
          --w-accent-soft: #d7ebe8;
          --w-panel: #f7faf9;
          --w-line: rgba(16, 32, 30, 0.12);
          font-family: var(--font-welcome-sans), system-ui, sans-serif;
        }
        .welcome-page .font-display {
          font-family: var(--font-welcome-display), Georgia, serif;
          font-weight: 400;
          letter-spacing: -0.02em;
        }
      `}</style>

      <section className="relative flex min-h-[100svh] flex-col overflow-hidden border-b border-[var(--w-line)]">
        <WelcomeHeroAtmosphere />

        <div className="relative z-10 flex flex-1 flex-col">
          {/* Frost full-height: forte a sinistra, dissolve a destra */}
          <div
            className="pointer-events-none absolute inset-0"
            aria-hidden
            style={{
              background:
                'linear-gradient(90deg, rgba(238,243,241,0.72) 0%, rgba(238,243,241,0.38) 36%, rgba(238,243,241,0.1) 58%, transparent 78%)',
              backdropFilter: 'blur(22px)',
              WebkitBackdropFilter: 'blur(22px)',
              maskImage:
                'linear-gradient(90deg, #000 0%, #000 36%, rgba(0,0,0,0.6) 58%, transparent 80%)',
              WebkitMaskImage:
                'linear-gradient(90deg, #000 0%, #000 36%, rgba(0,0,0,0.6) 58%, transparent 80%)',
            }}
          />

          <div className="relative mx-auto flex w-full max-w-5xl flex-1 flex-col px-5 sm:px-8">
            <header className="flex h-14 items-center justify-between">
              <Link href="/" className="text-[var(--w-ink)]" aria-label="Dubitor">
                <Logo className="h-5 w-5" />
              </Link>
              <div className="flex items-center gap-4">
                <Link
                  href={LOGIN_HREF}
                  className="text-sm font-medium text-[var(--w-muted)] hover:text-[var(--w-ink)]"
                >
                  Accedi
                </Link>
                <a
                  href="#perche"
                  className="hidden text-sm font-medium text-[var(--w-muted)] hover:text-[var(--w-ink)] sm:inline"
                >
                  Perché serve
                </a>
              </div>
            </header>

            <div className="flex flex-1 flex-col justify-center py-10 sm:py-14">
              <motion.p
                className="font-display text-[4.25rem] leading-[0.9] tracking-tight text-[var(--w-ink)] sm:text-7xl md:text-8xl"
                custom={0}
                initial="hidden"
                animate="show"
                variants={fadeUp}
              >
                Dubitor
              </motion.p>

              <motion.h1
                className="mt-8 max-w-2xl font-display text-[1.65rem] leading-[1.2] text-[var(--w-ink)] sm:mt-10 sm:text-4xl md:text-[2.75rem]"
                custom={1}
                initial="hidden"
                animate="show"
                variants={fadeUp}
              >
                Esperti umani rivedono le tue decisioni sull’IA.
              </motion.h1>

              <motion.p
                className="mt-5 max-w-lg text-[1.05rem] font-medium leading-relaxed text-[var(--w-ink)]/75 sm:text-lg"
                custom={2}
                initial="hidden"
                animate="show"
                variants={fadeUp}
              >
                L’IA dà risposte sicure di sé. Qui filosofi, ethics e risk —{' '}
                <mark className="rounded-sm bg-[var(--w-accent-soft)] px-1 py-0.5 text-[var(--w-ink)] [box-decoration-break:clone]">
                  persone reali
                </mark>
                , fuori dalla tua azienda — ti dicono{' '}
                <mark className="rounded-sm bg-[var(--w-accent-soft)] px-1 py-0.5 text-[var(--w-ink)] [box-decoration-break:clone]">
                  rischi e limiti
                </mark>{' '}
                e cosa non hai considerato.
              </motion.p>

              <motion.div
                className="mt-9 flex flex-wrap items-center gap-3"
                custom={3}
                initial="hidden"
                animate="show"
                variants={fadeUp}
              >
                <Link
                  href={APP_HREF}
                  className="inline-flex items-center gap-2 rounded-lg bg-[var(--w-accent)] px-5 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:brightness-110"
                >
                  Guarda un caso reale
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <a
                  href="#come-funziona"
                  className="inline-flex items-center gap-2 rounded-lg border border-[var(--w-line)] bg-white/75 px-5 py-3.5 text-sm font-semibold text-[var(--w-ink)] backdrop-blur-sm transition hover:border-[var(--w-accent)]"
                >
                  Come funziona
                </a>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      <div className="border-b border-[var(--w-line)] bg-[var(--w-ink)] text-[var(--w-bg)]">
        <div className="mx-auto grid max-w-5xl gap-6 px-5 py-7 sm:grid-cols-[auto_1fr] sm:items-baseline sm:gap-10 sm:px-8 sm:py-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--w-accent-soft)]">
            Un caso tipico
          </p>
          <p className="font-display text-xl leading-snug sm:text-2xl md:text-[1.65rem]">
            Ranking automatico in hiring. L’IA dice «procedi, risparmi tempo». Un esperto esterno
            chiede: «e a chi lo spieghi, quando lo escludi?»
          </p>
        </div>
      </div>

      <section id="perche" className="scroll-mt-20 border-b border-[var(--w-line)] bg-[var(--w-panel)] py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--w-accent)]">
            Il bisogno
          </p>
          <h2 className="mt-3 max-w-2xl font-display text-3xl leading-tight sm:text-4xl">
            Fidarsi solo dell’IA (o solo del team interno) lascia buchi che nessuno vede.
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[var(--w-muted)] sm:text-base">
            I modelli sono bravi a produrre risposte. Sono meno bravi a dire dove l’approccio è
            fragile, eticamente cieco o legalmente esposto. Serve uno sguardo esterno, umano,
            prima che la scelta diventi policy.
          </p>
          <div className="mt-10 grid gap-8 sm:grid-cols-3">
            {[
              {
                icon: Shield,
                title: 'Limiti dell’IA',
                body: 'Una risposta fluida non è una decisione giustificata. L’IA non sente il rischio residuo, il bias o ciò che non hai chiesto.',
              },
              {
                icon: Users,
                title: 'Red team umano',
                body: 'Persone reali — non un altro modello — mettono in discussione approccio, scarti e condizioni di stop.',
              },
              {
                icon: BadgeCheck,
                title: 'HITL esterno',
                body: 'Non è il tuo stesso ufficio che si auto-approva. È un giudizio metodologico fuori dal perimetro aziendale.',
              },
            ].map((item) => (
              <div key={item.title} className="space-y-3">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[var(--w-accent-soft)] text-[var(--w-accent)]">
                  <item.icon className="h-5 w-5" />
                </div>
                <h3 className="text-base font-semibold text-[var(--w-ink)]">{item.title}</h3>
                <p className="text-sm leading-relaxed text-[var(--w-muted)]">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="come-funziona" className="scroll-mt-20 border-b border-[var(--w-line)] py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--w-accent)]">
            Come funziona
          </p>
          <h2 className="mt-3 max-w-xl font-display text-3xl leading-tight sm:text-4xl">
            Metti la decisione in chiaro. Poi falla attaccare da chi sa dove guarda.
          </h2>
          <ol className="mt-10 grid gap-6 sm:grid-cols-3">
            {[
              {
                n: '01',
                title: 'Documenti la scelta',
                body: 'Domanda reale, cosa hai scartato, decisione, quando ti fermi. Niente slide opache.',
              },
              {
                n: '02',
                title: 'Arriva il red team',
                body: 'Esperti verificati annotano rischi, punti ciechi e domande non poste — a nome proprio.',
              },
              {
                n: '03',
                title: 'Decidi con più luce',
                body: 'Tieni, correggi o fermi: con un giudizio umano esterno, non solo con la confidenza del modello.',
              },
            ].map((step) => (
              <li
                key={step.n}
                className="rounded-2xl border border-[var(--w-line)] bg-[var(--w-panel)] p-6"
              >
                <span className="font-display text-3xl text-[var(--w-accent)]">{step.n}</span>
                <h3 className="mt-3 text-base font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--w-muted)]">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="border-b border-[var(--w-line)] bg-[var(--w-ink)] py-16 text-[var(--w-bg)] sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--w-accent-soft)]">
            Persone, non prompt
          </p>
          <h2 className="mt-3 max-w-2xl font-display text-3xl leading-tight sm:text-4xl">
            Il feedback che cerchi non lo genera un chatbot: lo firmano esseri umani.
          </h2>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/65 sm:text-base">
            Filosofi, ethics officer, risk e legal leggono la scheda e dicono cosa manca. È il
            pezzo che l’IA, da sola, non può sostituire: responsabilità e giudizio su un caso
            concreto.
          </p>
          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {[
              {
                role: 'Filosofo',
                line: '«Se non sappiamo dire a una persona perché è fuori, non stiamo selezionando: stiamo nascondendo un giudizio dietro un numero.»',
              },
              {
                role: 'Ethics / risk',
                line: 'Segnala bias residuali, condizioni di stop e cosa succede se il modello “funziona” ma resta ingiustificabile.',
              },
            ].map((q) => (
              <blockquote
                key={q.role}
                className="rounded-2xl border border-white/10 bg-white/5 p-6"
              >
                <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--w-accent-soft)]">
                  {q.role}
                </p>
                <p className="mt-3 font-display text-xl leading-snug text-white/95">{q.line}</p>
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="mx-auto flex max-w-6xl flex-col items-start gap-6 px-4 sm:flex-row sm:items-end sm:justify-between sm:px-6">
          <div className="max-w-xl">
            <h2 className="font-display text-3xl leading-tight sm:text-4xl">
              Non affidarti solo all’IA sulla prossima decisione.
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-[var(--w-muted)] sm:text-base">
              Apri il registro demo AI Ethics: hiring, biometriche, training data, human-in-the-loop
              — con spunti già firmati da esperti.
            </p>
          </div>
          <Link
            href={APP_HREF}
            className="inline-flex items-center gap-2 rounded-lg bg-[var(--w-accent)] px-5 py-3 text-sm font-semibold text-white transition hover:brightness-110"
          >
            Apri l’esempio
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <footer className="border-t border-[var(--w-line)] py-8">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 text-xs text-[var(--w-muted)] sm:px-6">
          <span className="inline-flex items-center gap-1.5">
            <Logo className="h-4 w-4" />
            Dubitor
          </span>
          <div className="flex gap-4">
            <Link href="/decisioni" className="hover:text-[var(--w-ink)]">
              Registro
            </Link>
            <Link href={LOGIN_HREF} className="hover:text-[var(--w-ink)]">
              Accedi
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
