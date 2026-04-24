"use client";

import { useState } from "react";
import { auth, db } from "@/lib/firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  sendEmailVerification,
  sendPasswordResetEmail,
  signOut
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, CheckCircle } from "lucide-react";

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForgotPwd, setShowForgotPwd] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const router = useRouter();

  const handleResendEmail = async () => {
    setError("");
    setMessage("");
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      await sendEmailVerification(userCredential.user);
      setMessage("Verification email resent. Please check your inbox.");
      await signOut(auth);
    } catch (err) {
      setError(err.message || "Failed to resend verification email.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!resetEmail) {
      setError("Enter valid email");
      return;
    }

    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, resetEmail);
      setMessage("Password reset link sent to your email 📩");
      setShowForgotPwd(false);
      setResetEmail("");
    } catch (err) {
      if (err.code === "auth/user-not-found") {
        setError("No account found");
      } else if (err.code === "auth/invalid-email") {
        setError("Enter valid email");
      } else {
        setError(err.message || "Failed to send reset email");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setMessage("");
    setLoading(true);
    const provider = new GoogleAuthProvider();

    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Check if user exists in Firestore
      const userDoc = await getDoc(doc(db, "users", user.uid));

      if (!userDoc.exists()) {
        // Create new user record
        const userData = {
          uid: user.uid,
          name: user.displayName || "Google User",
          email: user.email,
          createdAt: new Date().toISOString(),
          orders: [],
          role: "user" // Default role
        };
        await setDoc(doc(db, "users", user.uid), userData);
        router.push("/");
      } else {
        const userData = userDoc.data();
        if (userData.role === "admin") {
          router.push("/admin");
        } else {
          router.push("/");
        }
      }
    } catch (err) {
      setError(err.message || "An error occurred with Google Sign In");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      if (isLogin) {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        if (!user.emailVerified) {
          setError("Please verify your email before logging in.");
          await signOut(auth);
          setLoading(false);
          return;
        }

        // Fetch user data to check role
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists() && userDoc.data().role === "admin") {
          router.push("/admin");
        } else {
          router.push("/");
        }
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Send default verification email
        await sendEmailVerification(user);

        // Save to Firestore
        await setDoc(doc(db, "users", user.uid), {
          uid: user.uid,
          name: name,
          email: email,
          createdAt: new Date().toISOString(),
          orders: [],
          role: "user" // Default role
        });

        setMessage("Verification email sent. Please check your inbox.");
        await signOut(auth);
        setIsLogin(true);
      }
    } catch (err) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[var(--color-background)] min-h-[80vh] flex items-center justify-center p-4 relative">

      {/* Forgot Password Modal */}
      {showForgotPwd && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white max-w-sm w-full rounded-2xl p-6 shadow-xl border border-gray-100">
            <h2 className="text-xl font-serif text-[var(--color-text-main)] mb-2">Reset Password</h2>
            <p className="text-[var(--color-text-muted)] text-sm mb-4">
              Enter your email and we'll send you a link to reset your password.
            </p>
            {error && (
              <div className="bg-red-50 text-red-500 p-2.5 rounded-lg text-sm mb-4 text-center">
                {error}
              </div>
            )}
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className="relative">
                <input
                  type="email"
                  required
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:border-[var(--color-primary)] transition-all"
                  placeholder="you@gmail.com"
                />
                <Mail size={18} className="absolute left-3 top-3.5 text-gray-400" />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => { setShowForgotPwd(false); setError(""); setResetEmail(""); }}
                  disabled={loading}
                  className="flex-1 bg-gray-50 border border-gray-200 text-gray-700 py-3 rounded-lg font-medium transition-all hover:bg-gray-100 disabled:opacity-70"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-[var(--color-primary)] text-white py-3 rounded-lg font-medium transition-all hover:opacity-90 disabled:opacity-70"
                >
                  {loading ? "Sending..." : "Send Link"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white max-w-md w-full rounded-2xl p-8 shadow-sm border border-gray-100">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-serif text-[var(--color-text-main)] mb-2">
            {isLogin ? "Welcome Back" : "Create Account"}
          </h1>
          <p className="text-[var(--color-text-muted)] text-sm">
            {isLogin ? "Sign in to access your orders and wishlist" : "Join us to shop beautiful handmade crochet items"}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm mb-6 text-center flex flex-col items-center gap-2">
            <span>{error}</span>
            {error.includes("verify") && (
              <button
                onClick={handleResendEmail}
                className="text-[var(--color-primary)] font-bold hover:underline"
              >
                Resend Verification Email
              </button>
            )}
          </div>
        )}

        {message && (
          <div className="bg-green-50 text-green-600 p-4 rounded-xl text-sm mb-6 flex items-start gap-3 border border-green-100">
            <CheckCircle size={18} className="shrink-0 mt-0.5" />
            <span>{message}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-main)] mb-1">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-[var(--color-primary)] transition-all"
                placeholder="Your Name"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-[var(--color-text-main)] mb-1">Email Address</label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-gray-200 rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:border-[var(--color-primary)] transition-all"
                placeholder="you@gmail.com"
              />
              <Mail size={18} className="absolute left-3 top-3.5 text-gray-400" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--color-text-main)] mb-1">Password</label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-gray-200 rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:border-[var(--color-primary)] transition-all"
                placeholder="••••••••"
                minLength={6}
              />
              <Lock size={18} className="absolute left-3 top-3.5 text-gray-400" />
            </div>
            {isLogin && (
              <div className="flex justify-end mt-1.5">
                <button
                  type="button"
                  onClick={() => { setShowForgotPwd(true); setError(""); setMessage(""); setResetEmail(email); }}
                  className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors underline-offset-2 hover:underline"
                >
                  Forgot Password?
                </button>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[var(--color-primary)] text-white py-3.5 rounded-lg font-medium transition-all hover:opacity-90 active:scale-[0.98] flex justify-center mt-2 disabled:opacity-70"
          >
            {loading ? "Processing..." : (isLogin ? "Sign In" : "Create Account")}
          </button>
        </form>

        <div className="mt-2 flex items-center">
          <div className="flex-1 h-px bg-gray-100"></div>
          <span className="px-3 text-sm text-gray-400">or</span>
          <div className="flex-1 h-px bg-gray-100"></div>
        </div>

        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full mt-2 border border-gray-200 py-3.5 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z" fill="#EA4335" />
          </svg>
          Continue with Google
        </button>

        <div className="mt-2 text-center text-sm text-[var(--color-text-muted)]">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button
            type="button"
            onClick={() => { setIsLogin(!isLogin); setError(""); }}
            className="text-[var(--color-primary)] font-medium hover:underline"
          >
            {isLogin ? "Sign up" : "Log in"}
          </button>
        </div>
      </div>
    </div>
  );
}
