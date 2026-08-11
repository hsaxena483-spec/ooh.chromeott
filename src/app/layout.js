import './globals.css';

export const metadata = {
  title: 'Kolkata Brand Monitoring Dashboard',
  description: 'Interactive dashboard showing campaign locations and brand distribution across Kolkata.',
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
