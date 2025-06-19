import './globals.css';
import { Toaster } from 'react-hot-toast';
import { Inter } from "next/font/google";

export const metadata = {
  title: 'Play Chess - Local Network Chess Arena',
  description: 'Play Chess is a real-time multiplayer chess game over LAN. Create or join private rooms, challenge friends, and enjoy classic chess with timers and a modern interface.',
  keywords: ['Chess', 'LAN Chess', 'Multiplayer Chess', 'Real-time Chess', 'Chess Game', 'Local Network', 'Chess Timer', 'React Chess', 'Next.js Chess'],
  openGraph: {
    title: 'Play Chess - Local Network Chess Arena',
    description: 'Play Chess is a real-time multiplayer chess game over LAN. Create or join private rooms, challenge friends, and enjoy classic chess with timers and a modern interface.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Play Chess - Local Network Chess Arena',
    description: 'Play Chess is a real-time multiplayer chess game over LAN. Create or join private rooms, challenge friends, and enjoy classic chess with timers and a modern interface.',
  }
};

const inter = Inter({
  subsets: ['latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],          
  style: ['normal', 'italic'],   
  variable: '--font-inter',      
  display: 'swap',               
})

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <Toaster position="top-center" reverseOrder={false} />
        {children}
      </body>
    </html>
  );
}
