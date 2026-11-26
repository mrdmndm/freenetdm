import './globals.css';
import React from 'react';

export const metadata = {
  title: 'freenetdm — Маршрутизация Keenetic & Netcraze',
  description: 'Генератор правил DNS и статических маршрутов под AmneziaWG',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body className="bg-[#090a0f] text-gray-100">{children}</body>
    </html>
  );
}
