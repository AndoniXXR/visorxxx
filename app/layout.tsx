import type { Metadata, Viewport } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider';
import { ThemeToggleButton } from './ThemeToggleButton';
import { LanguageProvider } from '@/contexts/LanguageContext';

export const metadata: Metadata = {
  title: 'Dark Post Viewer',
  description: 'Visor de posts con soporte para múltiples fuentes',
  generator: 'Next.js',
  robots: 'noindex, nofollow', // Prevent search engine indexing
  referrer: 'strict-origin-when-cross-origin',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <style>{`
html {
  font-family: ${GeistSans.style.fontFamily};
  --font-sans: ${GeistSans.variable};
  --font-mono: ${GeistMono.variable};
}
        `}</style>
      </head>
      <body suppressHydrationWarning>
        <script dangerouslySetInnerHTML={{__html: `
          (function() {
            if (typeof window !== 'undefined') {
              let modalOpen = false;
              window.addEventListener('modalOpen', function() {
                modalOpen = true;
                window.history.pushState({modal: true}, '');
              });
              window.addEventListener('modalClose', function() {
                modalOpen = false;
                if (window.history.state && window.history.state.modal) {
                  window.history.back();
                }
              });
              window.addEventListener('popstate', function(e) {
                if (modalOpen && window.history.state && window.history.state.modal) {
                  const closeEvent = new Event('closeModalFromBack');
                  window.dispatchEvent(closeEvent);
                  modalOpen = false;
                }
              });
            }
          })();
        `}} />
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <LanguageProvider>
            {children}
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
