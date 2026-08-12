"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE !== undefined ? process.env.NEXT_PUBLIC_API_BASE : "";
const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "your_client_id";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // If already logged in, redirect to home
    if (localStorage.getItem("token")) {
      router.push("/");
    }
  }, [router]);

  const handleCredentialResponse = async (response) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/auth/google`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ credential: response.credential })
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        router.push("/");
      } else {
        setError(data.error || "Authentication failed.");
      }
    } catch (err) {
      console.error("Auth login fetch error:", err);
      setError("Unable to connect to authentication server.");
    } finally {
      setLoading(false);
    }
  };



  const initGoogleAuth = () => {
    if (typeof window !== "undefined" && window.google) {
      const btnContainer = document.getElementById("google-signin-btn");
      if (!btnContainer) {
        // Retry in 50ms if the DOM element is not mounted yet
        setTimeout(initGoogleAuth, 50);
        return;
      }

      try {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleCredentialResponse,
          auto_select: false,
          cancel_on_tap_outside: true
        });

        window.google.accounts.id.renderButton(
          btnContainer,
          {
            theme: "filled_blue", // Blue theme matching the first image
            size: "large",
            width: "340",         // Custom width matching standard pill buttons
            shape: "pill",        // Pill shape matching the first image
            text: "signin_with",
            logo_alignment: "left"
          }
        );
      } catch (err) {
        console.error("Google Auth init error:", err);
        setError("Failed to initialize Google Sign-in.");
      }
    }
  };

  useEffect(() => {
    // Check if script already loaded
    if (typeof window !== "undefined" && window.google) {
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
      
      <div className="wizard-page-container">
        <div className="wizard-content">
          {/* COTT Logo applied at the top */}
          <img 
            src="/logo.png" 
            alt="COTT Logo" 
            className="wizard-logo-img" 
          />
          
          <h1 className="wizard-title">Sign into Google</h1>
          <p className="wizard-subtitle">Sign in to Google to access COTT Analytics</p>

          {error && (
            <div className="wizard-error-alert">
              <span>{error}</span>
            </div>
          )}

          <div className="wizard-action-container">
            {loading ? (
              <div className="wizard-loader">
                <div className="mini-spinner"></div>
                <span>Authenticating session...</span>
              </div>
            ) : (
              <div id="google-signin-btn" className="google-btn-wrapper"></div>
            )}
          </div>
        </div>

        <style jsx global>{`
          .wizard-page-container {
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            background-color: #1e1e1e; /* Flat dark charcoal background */
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            color: #d4d4d4;
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            z-index: 9998;
            padding: 40px;
            box-sizing: border-box;
          }

          .wizard-content {
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
            flex-grow: 1;
            justify-content: center;
            max-width: 480px;
            width: 100%;
            margin-bottom: 80px; /* Leave room for footer */
          }

          .wizard-logo-img {
            width: 64px;
            height: 64px;
            margin-bottom: 20px;
            filter: drop-shadow(0 0 10px rgba(139, 92, 246, 0.2));
            animation: logo-fade 0.5s ease forwards;
          }

          @keyframes logo-fade {
            from {
              opacity: 0;
              transform: scale(0.9);
            }
            to {
              opacity: 1;
              transform: scale(1);
            }
          }

          .wizard-title {
            font-size: 1.6rem;
            font-weight: 500;
            color: #ffffff;
            margin: 0 0 10px 0;
            letter-spacing: -0.2px;
          }

          .wizard-subtitle {
            font-size: 0.9rem;
            color: #858585; /* Soft grey subtitle */
            margin: 0 0 25px 0;
          }

          .wizard-error-alert {
            background-color: rgba(241, 76, 76, 0.1);
            border: 1px solid rgba(241, 76, 76, 0.2);
            color: #f14c4c;
            padding: 10px 16px;
            border-radius: 4px;
            font-size: 0.85rem;
            margin-bottom: 20px;
            width: 100%;
            max-width: 320px;
            box-sizing: border-box;
          }

          .wizard-action-container {
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 50px;
            margin-bottom: 30px;
            width: 100%;
          }

          .google-btn-wrapper {
            display: flex;
            justify-content: center;
            width: 100%;
          }

          .google-btn-wrapper iframe {
            margin: 0 auto !important;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            border-radius: 9999px;
          }

          .wizard-loader {
            display: flex;
            align-items: center;
            gap: 10px;
            color: #858585;
            font-size: 0.9rem;
          }

          .mini-spinner {
            width: 16px;
            height: 16px;
            border: 2px solid rgba(255, 255, 255, 0.1);
            border-radius: 50%;
            border-top-color: #d4d4d4;
            animation: wizard-spin-global 1s linear infinite;
          }

          .wizard-link-container {
            margin-top: 15px;
          }

          .wizard-link {
            color: #3b82f6; /* Slate blue link color matching VSCode setup */
            font-size: 0.85rem;
            text-decoration: none;
            cursor: pointer;
            transition: color 0.2s ease;
          }

          .wizard-link:hover {
            color: #60a5fa;
            text-decoration: underline;
          }

          /* Wizard Navigation Footer */
          .wizard-footer {
            display: flex;
            align-items: center;
            justify-content: space-between;
            width: 100%;
            max-width: 800px;
            padding: 20px 0;
            position: absolute;
            bottom: 40px;
            box-sizing: border-box;
          }

          .wizard-nav-btn {
            background-color: transparent;
            border: none;
            color: #5a5a5a;
            font-size: 0.9rem;
            cursor: not-allowed;
            padding: 8px 16px;
            border-radius: 4px;
            transition: all 0.2s ease;
            font-family: inherit;
          }

          .wizard-nav-btn.next-btn {
            background-color: #333333;
            color: #858585;
            border: 1px solid #444444;
            display: flex;
            align-items: center;
            gap: 6px;
          }

          .next-icon {
            font-size: 0.8rem;
          }

          .wizard-dots {
            display: flex;
            gap: 10px;
          }

          .wizard-dots .dot {
            width: 6px;
            height: 6px;
            border-radius: 50%;
            background-color: #3a3a3a;
          }

          .wizard-dots .dot.active {
            background-color: #007acc; /* VSCode blue active dot */
            box-shadow: 0 0 6px #007acc;
          }

          @keyframes wizard-spin-global {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </>
  );
}
