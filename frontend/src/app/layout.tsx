import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "StudentsAI - Your Intelligent Study Companion",
  description: "AI-powered study assistant for students. Create notes, generate summaries, flashcards, and visualize knowledge connections.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased font-sans">
        {children}
      </body>
    </html>
  );
}