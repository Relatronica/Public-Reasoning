import { redirect } from 'next/navigation';

/** Alias legacy → homepage di presentazione. */
export default function WelcomeRedirectPage() {
  redirect('/');
}
