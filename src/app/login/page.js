'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Script from 'next/script';

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // If already logged in, redirect to dashboard
    if (localStorage.getItem('token')) {
      router.push('/');
    }
  }, [router]);

  const handleCredentialResponse = async (response) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ credential: response.credential })
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        router.push('/');
      } else {
        setError(data.error || 'Authentication failed.');
      }
    } catch (err) {
      console.error('Auth login fetch error:', err);
      setError('Unable to connect to the authentication server.');
    } finally {
      setLoading(false);
    }
  };

  const initGoogleAuth = () => {
    if (typeof window !== 'undefined' && window.google) {
      const btnContainer = document.getElementById('google-signin-btn');
      if (!btnContainer) {
        setTimeout(initGoogleAuth, 50);
        return;
      }

      try {
        const client_id = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
        if (!client_id) {
          console.error('Google Client ID is missing in environment variables');
          setError('Google Client ID is not configured.');
          return;
        }

        window.google.accounts.id.initialize({
          client_id: client_id,
          callback: handleCredentialResponse,
          auto_select: false,
          cancel_on_tap_outside: true
        });

        window.google.accounts.id.renderButton(
          btnContainer,
          {
            theme: 'filled_blue',
            size: 'large',
            width: '320',
            shape: 'pill',
            text: 'signin_with',
            logo_alignment: 'left'
          }
        );
      } catch (err) {
        console.error('Google Auth init error:', err);
        setError('Failed to initialize Google Sign-in.');
      }
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined' && window.google) {
      initGoogleAuth();
    }
  }, []);

  return (
    <>
      <Script
        src="https://accounts.google.com/gsi/client"
        onLoad={initGoogleAuth}
        strategy="afterInteractive"
      />

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#06070d', // Matches --bg-main
        backgroundImage: `
          radial-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 0),
          radial-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 0)
        `,
        backgroundSize: '24px 24px',
        backgroundPosition: '0 0, 12px 12px',
        fontFamily: "'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        color: '#f8fafc',
        padding: '24px',
        boxSizing: 'border-box'
      }}>
        {/* Glassmorphism Login Card */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          maxWidth: '440px',
          width: '100%',
          padding: '48px 36px',
          background: 'rgba(17, 18, 36, 0.65)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '24px',
          boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.7), 0 0 50px 0px rgba(59, 130, 246, 0.05)',
          boxSizing: 'border-box',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Top Decorative Glow */}
          <div style={{
            position: 'absolute',
            top: '-50px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '150px',
            height: '100px',
            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%)',
            pointerEvents: 'none'
          }} />

          {/* Logo */}
          <img
            src="/logo.png"
            alt="Logo"
            style={{
              width: '72px',
              height: '72px',
              marginBottom: '24px',
              filter: 'drop-shadow(0 0 15px rgba(59, 130, 246, 0.3))',
              objectFit: 'contain'
            }}
          />

          <h1 style={{
            fontSize: '28px',
            fontWeight: 700,
            color: '#f8fafc',
            margin: '0 0 8px 0',
            letterSpacing: '-0.5px',
            background: 'linear-gradient(135deg, #ffffff 0%, #cbd5e1 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Welcome Back
          </h1>

          <p style={{
            fontSize: '14px',
            color: '#94a3b8',
            margin: '0 0 32px 0',
            lineHeight: 1.5
          }}>
            Sign in to access your Brand & OOH Campaign Dashboard
          </p>

          {error && (
            <div style={{
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              color: '#f87171',
              padding: '12px 16px',
              borderRadius: '12px',
              fontSize: '13px',
              fontWeight: 500,
              marginBottom: '24px',
              width: '100%',
              textAlign: 'center',
              boxSizing: 'border-box'
            }}>
              {error}
            </div>
          )}

          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '44px',
            width: '100%'
          }}>
            {loading ? (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                color: '#94a3b8',
                fontSize: '14px',
                fontWeight: 500
              }}>
                {/* Custom CSS animation for Spinner */}
                <div style={{
                  width: '18px',
                  height: '18px',
                  border: '2px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '50%',
                  borderTopColor: '#3b82f6',
                  animation: 'spin 1s linear infinite'
                }} />
                <span>Authenticating session...</span>
              </div>
            ) : (
              <div id="google-signin-btn" style={{
                display: 'flex',
                justifyContent: 'center',
                width: '100%',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
                borderRadius: '9999px',
                overflow: 'hidden'
              }} />
            )}
          </div>
        </div>

        {/* Global Keyframes for Spinner */}
        <style jsx global>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </>
  );
}
