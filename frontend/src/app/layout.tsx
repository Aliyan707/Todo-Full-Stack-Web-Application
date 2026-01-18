import { AuthProvider } from '../providers/AuthProvider';
import './globals.css';

export const metadata = {
  title: 'AI Todo Assistant',
  description: 'An AI-powered todo management system with natural language interface',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}