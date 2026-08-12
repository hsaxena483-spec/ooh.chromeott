import './globals.css';

export const metadata = {
  title: 'Chromedm cott - Brand & OOH Campaign Dashboard',
  description: 'Interactive dashboard for Chromedm cott monitoring campaign locations and brand distribution.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
