"use client";
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from '../contexts/AuthContext';
export default function Providers({ children }: { children: React.ReactNode }) {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  if (!clientId) throw new Error('Chưa cấu hình NEXT_PUBLIC_GOOGLE_CLIENT_ID.');
  return <GoogleOAuthProvider clientId={clientId}><AuthProvider>{children}</AuthProvider></GoogleOAuthProvider>;
}
