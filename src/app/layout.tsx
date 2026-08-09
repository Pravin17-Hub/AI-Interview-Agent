import '../styles/variables.css';
import '../styles/global.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Cohort Interview Agent',
  description: 'ABTalks Vibe Coding Hackathon - AI Interview Agent',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
