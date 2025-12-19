"use client"

import * as React from "react"
import { useAuth } from "../../contexts/AuthContext"
import { useNavigate } from "react-router-dom"

const SignUp = () => {
    const [name, setName] = React.useState("");
    const [email, setEmail] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [confirmPassword, setConfirmPassword] = React.useState("");
    const [error, setError] = React.useState("");
    const [success, setSuccess] = React.useState("");
    const [loading, setLoading] = React.useState(false);
    const [agreedToTerms, setAgreedToTerms] = React.useState(false);
    const { signInWithGoogle, signUpWithEmail, user } = useAuth();
    const navigate = useNavigate();

    // Redirect if already logged in
    React.useEffect(() => {
        if (user) {
            navigate('/');
        }
    }, [user, navigate]);

    const validateEmail = (email: string) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    const handleSignUp = async () => {
        if (!name || !email || !password || !confirmPassword) {
            setError("Please fill in all fields.");
            return;
        }
        if (!validateEmail(email)) {
            setError("Please enter a valid email address.");
            return;
        }
        if (password.length < 8) {
            setError("Password must be at least 8 characters long.");
            return;
        }
        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }
        if (!agreedToTerms) {
            setError("Please agree to the terms and conditions.");
            return;
        }
        setError("");
        setLoading(true);

        try {
            await signUpWithEmail(email, password, name);
            setSuccess("Account created! Please check your email to verify your account.");
        } catch (err: any) {
            setError(err.message || "Failed to sign up. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignUp = async () => {
        setError("");
        setLoading(true);
        try {
            await signInWithGoogle();
            // Redirect happens automatically via Supabase OAuth
        } catch (err: any) {
            setError(err.message || "Failed to sign up with Google.");
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#020204] relative overflow-hidden w-full py-12">
            {/* Background effects matching Vertex theme */}
            <div className="fixed z-0 pointer-events-none top-0 right-0 bottom-0 left-0">
                <div className="absolute inset-0 tech-grid opacity-20"></div>
                <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl float"></div>
                <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl float-delayed"></div>
            </div>

            {/* Centered glass card */}
            <div className="relative z-10 w-full max-w-md rounded-2xl bg-gradient-to-br from-[#0a0a0c] to-[#050505] backdrop-blur-xl border border-white/10 shadow-2xl p-8 flex flex-col items-center">
                {/* Logo */}
                <div className="flex items-center justify-center w-14 h-14 rounded-full bg-purple-500/20 mb-6 shadow-lg border border-purple-500/30 pulse-glow">
                    <img src="/Sentinellogo.jpg" alt="Sentinel AI" className="text-purple-400" width="28" />
                </div>

                {/* Title */}
                <h2 className="text-3xl font-bold text-white mb-2 text-center font-serif">
                    Join the 1%
                </h2>
                <p className="text-sm text-slate-400 mb-8 text-center">
                    Start your accountability journey today
                </p>

                {/* Form */}
                <div className="flex flex-col w-full gap-4">
                    {/* Google Sign Up - Primary option */}
                    <button
                        onClick={handleGoogleSignUp}
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-100 border border-white/20 rounded-lg px-5 py-3.5 font-semibold text-gray-800 shadow-lg transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <iconify-icon icon="lucide:loader-2" width="20" className="animate-spin"></iconify-icon>
                        ) : (
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                        )}
                        Continue with Google
                    </button>

                    <div className="relative my-2">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-white/10"></div>
                        </div>
                        <div className="relative flex justify-center text-xs">
                            <span className="px-2 bg-[#0a0a0c] text-slate-500">Or sign up with email</span>
                        </div>
                    </div>

                    {success && (
                        <div className="text-sm text-emerald-400 text-left flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-3">
                            <iconify-icon icon="lucide:check-circle" width="18"></iconify-icon>
                            {success}
                        </div>
                    )}

                    <div className="w-full flex flex-col gap-3">
                        <input
                            placeholder="Full name"
                            type="text"
                            value={name}
                            className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                            onChange={(e) => setName(e.target.value)}
                            disabled={loading}
                        />
                        <input
                            placeholder="Email address"
                            type="email"
                            value={email}
                            className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={loading}
                        />
                        <input
                            placeholder="Password (min. 8 characters)"
                            type="password"
                            value={password}
                            className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={loading}
                        />
                        <input
                            placeholder="Confirm password"
                            type="password"
                            value={confirmPassword}
                            className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            disabled={loading}
                            onKeyPress={(e) => e.key === 'Enter' && handleSignUp()}
                        />
                        {error && (
                            <div className="text-sm text-red-400 text-left flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                                <iconify-icon icon="lucide:alert-circle" width="16"></iconify-icon>
                                {error}
                            </div>
                        )}
                    </div>

                    <label className="flex items-start gap-3 text-xs text-slate-400 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={agreedToTerms}
                            onChange={(e) => setAgreedToTerms(e.target.checked)}
                            className="w-4 h-4 mt-0.5 rounded bg-white/5 border-white/10"
                            disabled={loading}
                        />
                        <span>
                            I agree to the{" "}
                            <a href="#" className="text-purple-400 hover:text-purple-300 transition-colors">
                                Terms of Service
                            </a>{" "}
                            and{" "}
                            <a href="#" className="text-purple-400 hover:text-purple-300 transition-colors">
                                Privacy Policy
                            </a>
                        </span>
                    </label>

                    <button
                        onClick={handleSignUp}
                        disabled={loading}
                        className="w-full bg-purple-600 hover:bg-purple-500 text-white font-semibold px-5 py-3 rounded-lg shadow-[0_0_20px_rgba(168,85,247,0.3)] hover:shadow-[0_0_30px_rgba(168,85,247,0.5)] transition-all mt-2 text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <iconify-icon icon="lucide:loader-2" width="16" className="animate-spin"></iconify-icon>
                        ) : (
                            <>
                                Create Account
                                <iconify-icon icon="lucide:arrow-right" width="16"></iconify-icon>
                            </>
                        )}
                    </button>

                    <div className="w-full text-center mt-4">
                        <span className="text-sm text-slate-400">
                            Already have an account?{" "}
                            <a
                                href="/signin"
                                className="text-purple-400 hover:text-purple-300 font-medium transition-colors"
                            >
                                Sign in
                            </a>
                        </span>
                    </div>
                </div>
            </div>

            {/* Benefits */}
            <div className="relative z-10 mt-12 grid grid-cols-3 gap-8 max-w-2xl">
                <div className="text-center">
                    <div className="w-12 h-12 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mx-auto mb-3">
                        <iconify-icon icon="lucide:zap" className="text-purple-400" width="20"></iconify-icon>
                    </div>
                    <p className="text-xs text-slate-400">AI-Powered<br />Verification</p>
                </div>
                <div className="text-center">
                    <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-3">
                        <iconify-icon icon="lucide:bar-chart-3" className="text-emerald-400" width="20"></iconify-icon>
                    </div>
                    <p className="text-xs text-slate-400">Advanced<br />Analytics</p>
                </div>
                <div className="text-center">
                    <div className="w-12 h-12 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mx-auto mb-3">
                        <iconify-icon icon="lucide:shield-check" className="text-blue-400" width="20"></iconify-icon>
                    </div>
                    <p className="text-xs text-slate-400">100% Free<br />Forever</p>
                </div>
            </div>
        </div>
    );
};

export { SignUp };
