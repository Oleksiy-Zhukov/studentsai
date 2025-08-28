import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "StudentsAI - Your Intelligent Study Companion",
  description: "AI-powered study assistant for students. Create notes, generate summaries, flashcards, and visualize knowledge connections.",
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/studentsai-icon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Prevent theme flash; default to dark if unset */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "(function(){try{var m=localStorage.getItem('theme');var prefersDark=window.matchMedia('(prefers-color-scheme: dark)').matches;var isDark=(m==='dark')||(!m&&true)||(m==='system'&&prefersDark);if(m==='light'){document.documentElement.classList.remove('dark');}else if(isDark){document.documentElement.classList.add('dark');}}catch(e){document.documentElement.classList.add('dark');}})();",
          }}
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased font-sans bg-white text-gray-900 dark:bg-[#0f1115] dark:text-gray-100">
        {children}
      </body>
    </html>
  );
}