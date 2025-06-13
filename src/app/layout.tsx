import './globals.css';
import { Toaster } from 'react-hot-toast';

import { Inter } from "next/font/google";

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
