import type { Metadata } from 'next';
import { DM_Sans, Instrument_Serif } from 'next/font/google';

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-welcome-sans',
  display: 'swap',
});

const instrument = Instrument_Serif({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-welcome-display',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Dubitor — Esperti umani rivedono le tue decisioni sull’IA',
  description:
    'L’IA dà risposte sicure di sé. Filosofi, ethics e risk esterni alla tua azienda ti dicono rischi, limiti e punti ciechi.',
};

export default function WelcomeLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${dmSans.variable} ${instrument.variable} h-full`}>{children}</div>
  );
}
