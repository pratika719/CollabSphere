import { useState } from "react";
import { Link } from "react-router-dom";
import useRegister from "../../../hooks/useRegister.js";

export default function RegisterPage() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [validationError, setValidationError] = useState("");

    const { register, isPending, isError, error } = useRegister();

    const handleSubmit = (e) => {
        e.preventDefault();
        setValidationError("");

        if (!name.trim() || !email.trim() || !password.trim()) {
            setValidationError("Please fill out all fields.");
            return;
        }

        if (password !== confirmPassword) {
            setValidationError("Passwords do not match.");
            return;
        }

        if (password.length < 6) {
            setValidationError("Password must be at least 6 characters.");
            return;
        }

        register({ name, email, password });
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="space-y-2">
                <h2 className="text-3xl font-extrabold tracking-tight text-white text-left">
                    Create Account
                </h2>
                <p className="text-slate-400 text-sm text-left">
                    Join CollabSphere and start managing your workspaces.
                </p>
            </div>

            {/* Error alerts */}
            {(validationError || isError) && (
                <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-start space-x-2 animate-shake">
                    <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <span className="text-left font-medium">
                        {validationError || error?.response?.data?.message || "Registration failed. Please check your parameters."}
                    </span>
                </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block text-left" htmlFor="name">
                        Full Name
                    </label>
                    <input
                        id="name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        disabled={isPending}
                        placeholder="John Doe"
                        className="w-full bg-slate-950/70 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 transition duration-200 disabled:opacity-50 text-left"
                    />
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block text-left" htmlFor="email">
                        Email Address
                    </label>
                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={isPending}
                        placeholder="john@example.com"
                        className="w-full bg-slate-950/70 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 transition duration-200 disabled:opacity-50 text-left"
                    />
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block text-left" htmlFor="password">
                        Password
                    </label>
                    <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={isPending}
                        placeholder="Min. 6 characters"
                        className="w-full bg-slate-950/70 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 transition duration-200 disabled:opacity-50 text-left"
                    />
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block text-left" htmlFor="confirmPassword">
                        Confirm Password
                    </label>
                    <input
                        id="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        disabled={isPending}
                        placeholder="Re-enter password"
                        className="w-full bg-slate-950/70 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 transition duration-200 disabled:opacity-50 text-left"
                    />
                </div>

                <button
                    type="submit"
                    disabled={isPending}
                    className="w-full mt-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold py-3 px-4 rounded-xl shadow-lg shadow-purple-500/20 hover:shadow-purple-500/30 active:scale-[0.99] transition duration-150 disabled:opacity-50 flex items-center justify-center space-x-2"
                >
                    {isPending ? (
                        <>
                            <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            <span>Creating account...</span>
                        </>
                    ) : (
                        <span>Sign Up</span>
                    )}
                </button>
            </form>

            {/* Switch to Login */}
            <div className="pt-2 border-t border-slate-800/80 text-center text-sm text-slate-400">
                Already have an account?{" "}
                <Link to="/login" className="font-semibold text-purple-400 hover:text-purple-300 hover:underline transition">
                    Sign in here
                </Link>
            </div>
        </div>
    );
}
