import { useState } from "react";
import useAuthStore from "../store/auth.store.js";
import { changePassword } from "../services/auth.api.js";
import AvatarUpload from "../components/upload/AvatarUpload.jsx";

export default function ProfilePage() {
    const { user } = useAuthStore();
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isPending, setIsPending] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        if (newPassword !== confirmPassword) {
            setError("New passwords do not match");
            return;
        }

        if (newPassword.length < 6) {
            setError("Password must be at least 6 characters long");
            return;
        }

        setIsPending(true);
        try {
            await changePassword({ oldPassword, newPassword });
            setSuccess("Password changed successfully!");
            setOldPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } catch (err) {
            setError(err.response?.data?.message || "Failed to change password");
        } finally {
            setIsPending(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 py-4">
            {/* Profile Header */}
            <div className="relative overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 p-8 shadow-2xl">
                <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl -mr-32 -mt-32" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -ml-32 -mb-32" />
                
                <div className="relative flex flex-col md:flex-row items-center gap-8">
                    <AvatarUpload
                        currentAvatar={user?.avatar}
                        userName={user?.name}
                    />
                    <div className="text-center md:text-left space-y-2">
                        <h1 className="text-3xl font-extrabold text-white">{user?.name}</h1>
                        <p className="text-slate-400 font-medium flex items-center justify-center md:justify-start gap-2">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            {user?.email}
                        </p>
                        <div className="flex items-center justify-center md:justify-start gap-3 mt-4">
                            <span className="px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[11px] font-bold uppercase tracking-wider">
                                {user?.role || "Member"}
                            </span>
                            <span className="text-slate-500 text-[11px] font-medium italic">
                                User ID: {user?._id}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Account Details */}
                <div className="md:col-span-1 space-y-6">
                    <h3 className="text-lg font-bold text-white px-1">Account Info</h3>
                    <div className="bg-white/[0.02] border border-slate-800/60 rounded-2xl p-6 space-y-4">
                        <div className="space-y-1">
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Full Name</p>
                            <p className="text-[14px] text-slate-300 font-medium">{user?.name}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Email Address</p>
                            <p className="text-[14px] text-slate-300 font-medium">{user?.email}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Member Since</p>
                            <p className="text-[14px] text-slate-300 font-medium">
                                {new Date(user?.createdAt).toLocaleDateString("en-US", { 
                                    month: "long", 
                                    day: "numeric", 
                                    year: "numeric" 
                                })}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Change Password */}
                <div className="md:col-span-2 space-y-6">
                    <h3 className="text-lg font-bold text-white px-1">Security</h3>
                    <div className="bg-white/[0.02] border border-slate-800/60 rounded-2xl p-6">
                        <form onSubmit={handlePasswordChange} className="space-y-6">
                            <div className="space-y-4">
                                <h4 className="text-[13px] font-bold text-slate-400">Change Password</h4>
                                
                                {error && (
                                    <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium">
                                        {error}
                                    </div>
                                )}
                                
                                {success && (
                                    <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
                                        {success}
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Current Password</label>
                                    <input
                                        type="password"
                                        value={oldPassword}
                                        onChange={(e) => setOldPassword(e.target.value)}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500/50 transition-colors"
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">New Password</label>
                                        <input
                                            type="password"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500/50 transition-colors"
                                            placeholder="••••••••"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Confirm New Password</label>
                                        <input
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500/50 transition-colors"
                                            placeholder="••••••••"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end pt-2">
                                <button
                                    type="submit"
                                    disabled={isPending}
                                    className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-[13px] font-bold shadow-lg shadow-purple-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                >
                                    {isPending ? (
                                        <div className="flex items-center gap-2">
                                            <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Updating...
                                        </div>
                                    ) : "Update Password"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
