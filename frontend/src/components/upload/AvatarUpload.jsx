import { useState, useRef } from "react";
import { useUploadAvatar } from "../../hooks/useUploads.js";
import useAuthStore from "../../store/auth.store.js";
import UserAvatar from "../common/UserAvatar.jsx";

/*
|--------------------------------------------------------------------------
| AVATAR UPLOAD COMPONENT
|--------------------------------------------------------------------------
|
| Reusable avatar upload with:
|   - Click-to-browse file picker
|   - Local preview before upload
|   - Upload button + loading state
|   - Error display for invalid files
|
| Architecture:
|   1. User clicks the avatar area → hidden <input type="file"> opens
|   2. File is validated client-side (type, size) for instant feedback
|   3. Preview is generated via FileReader → displayed immediately
|   4. "Upload" button sends the file via useUploadAvatar mutation
|   5. On success, Zustand auth store refreshes → avatar appears everywhere
|
| Props:
|   currentAvatar: string | null — existing avatar URL
|   userName: string — used for fallback initials
|
*/

const MAX_SIZE_MB = 2;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export default function AvatarUpload({ currentAvatar, userName }) {
    const fileInputRef = useRef(null);
    const [preview, setPreview] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [error, setError] = useState(null);

    const { mutate: uploadAvatar, isPending } = useUploadAvatar();
    const { checkAuth } = useAuthStore();

    const handleFileSelect = (e) => {
        setError(null);
        const file = e.target.files?.[0];
        if (!file) return;

        // Client-side validation (matches backend config)
        if (!ALLOWED_TYPES.includes(file.type)) {
            setError("Only JPEG, PNG, and WebP images are allowed.");
            return;
        }

        if (file.size > MAX_SIZE_MB * 1024 * 1024) {
            setError(`File must be smaller than ${MAX_SIZE_MB} MB.`);
            return;
        }

        setSelectedFile(file);

        // Generate instant preview using FileReader API
        const reader = new FileReader();
        reader.onload = (e) => setPreview(e.target.result);
        reader.readAsDataURL(file);
    };

    const handleUpload = () => {
        if (!selectedFile) return;

        uploadAvatar(selectedFile, {
            onSuccess: () => {
                setSelectedFile(null);
                setPreview(null);
                setError(null);
                // Refresh auth store so the new avatar appears in sidebar, etc.
                checkAuth();
            },
            onError: (err) => {
                setError(err.response?.data?.message || "Upload failed. Please try again.");
            },
        });
    };

    const handleCancel = () => {
        setSelectedFile(null);
        setPreview(null);
        setError(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const displayImage = preview || currentAvatar;

    return (
        <div className="space-y-4">
            {/* Avatar display — clickable */}
            <div className="flex items-center gap-5">
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="relative group w-24 h-24 rounded-2xl overflow-hidden shadow-xl shadow-purple-500/20 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                    title="Click to change avatar"
                >
                    <UserAvatar 
                        user={{ name: userName, avatar: displayImage }} 
                        size="w-full h-full" 
                        fontSize="text-3xl"
                    />

                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    </div>
                </button>

                <div className="space-y-1">
                    <p className="text-[13px] font-semibold text-slate-300">
                        {selectedFile ? selectedFile.name : "Click avatar to change"}
                    </p>
                    <p className="text-[11px] text-slate-500">
                        JPEG, PNG, WebP · Max {MAX_SIZE_MB} MB
                    </p>
                </div>
            </div>

            {/* Hidden file input */}
            <input
                ref={fileInputRef}
                type="file"
                accept={ALLOWED_TYPES.join(",")}
                onChange={handleFileSelect}
                className="hidden"
            />

            {/* Error message */}
            {error && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium">
                    {error}
                </div>
            )}

            {/* Action buttons — appear when a file is selected */}
            {selectedFile && (
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={handleUpload}
                        disabled={isPending}
                        className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-[13px] font-bold shadow-lg shadow-purple-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        {isPending ? (
                            <span className="flex items-center gap-2">
                                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Uploading...
                            </span>
                        ) : (
                            "Upload Avatar"
                        )}
                    </button>
                    <button
                        type="button"
                        onClick={handleCancel}
                        disabled={isPending}
                        className="px-4 py-2 rounded-xl text-[13px] font-semibold text-slate-400 hover:text-slate-200 hover:bg-white/[0.04] transition-all disabled:opacity-50"
                    >
                        Cancel
                    </button>
                </div>
            )}
        </div>
    );
}
