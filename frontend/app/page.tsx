/**
 * Landing Page - Advanced To-Do Application UI
 * Feature: 003-advanced-todo-ui
 *
 * Dynamic landing page with animated dark green background and hero section.
 */

import { Metadata } from 'next';
import AnimatedBackground from '@/components/landing/AnimatedBackground';
import LandingNav from '@/components/landing/LandingNav';
import HeroSection from '@/components/landing/HeroSection';

export const metadata: Metadata = {
  title: 'Advanced To-Do App | Organize Your Life with Style',
  description:
    'A modern, visually unique To-Do application with dynamic animations and a dark green theme. Stay productive and organized with beautiful design.',
  keywords: ['todo', 'task management', 'productivity', 'dark green theme', 'animated'],
  openGraph: {
    title: 'Advanced To-Do App | Organize Your Life with Style',
    description:
      'A modern, visually unique To-Do application with dynamic animations and a dark green theme.',
    type: 'website',
  },
};

export default function LandingPage() {
  return (
    <main>
      <AnimatedBackground />
      <LandingNav />
      <HeroSection />
    </main>
  );
}
