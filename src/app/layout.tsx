import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/layout/Navbar';

export const metadata: Metadata = {
  title: 'M3-FX | USD/LKR Intelligence Platform',
  description:
    'Multivariate LSTM 5-day USD/LKR exchange rate forecasting powered by macro signals, central bank policy, trade data & live sentiment analysis.',
  keywords: 'USD LKR exchange rate forecast Sri Lanka CBSL LSTM AI',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  );
}
