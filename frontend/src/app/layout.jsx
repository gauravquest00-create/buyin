import { Inter } from 'next/font/google';
import '../styles/globals.css';
import { Navbar } from '../components/Navbar.jsx';
import { Footer } from '../components/Footer.jsx';
import { MotionShell } from '../components/MotionShell.jsx';

const inter = Inter({ subsets: ['latin'], display: 'swap' });

export const metadata = {
  title: 'BUYIN - Real Estate Buyer Requirement & Lead Network',
  description:
    'Connect with genuine real-estate buyer requirements through BUYIN. Exclusive 20-day ownership, masked pre-claim privacy, and transparent wallet-based claiming.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.className}>
      <body>
        <Navbar />
        <main>
          <MotionShell>{children}</MotionShell>
        </main>
        <Footer />
      </body>
    </html>
  );
}