import { useState, useRef } from "react";
import { useUploadAttachments, useDeleteAttachment } from "../../hooks/useUploads.js";

/*
|--------------------------------------------------------------------------
| ATTACHMENT UPLOAD COMPONENT
|--------------------------------------------------------------------------
|
| Drag-and-drop file zone + existing attachment list for tasks.
|
| Architecture:
|   - Drop zone with visual drag-over feedback
|   - Click to browse files
|   - Staged files shown with size & remove button before upload
|   - "Upload" button triggers batch upload mutation
|   - Existing attachments shown with thumbnails / file icons + delete
|   - Respects per-task limit (5 attachments max)
|
| Props:
|   taskId: string
|   boardId: string
|   attachments: Array<{ _id, url, filename, mimetype, size, uploadedBy, uploadedAt }>
|
*/

const MAX_FILES = 5;
const MAX_SIZE_MB = 10;

// Map common MIME types to user-friendly labels and colors
const FILE_TYPE_MAP = {
    "image/jpeg":       { icon: "🖼️", label: "JPEG",  color: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
    "image/png":        { icon: "🖼️", label: "PNG",   color: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
    "image/webp":       { icon: "🖼️", label: "WebP",  color: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
    "image/gif":        { icon: "🖼️", label: "GIF",   color: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
    "application/pdf":  { icon: "📄", label: "PDF",   color: "bg-red-500/10 text-red-400 border-red-500/20" },
    "text/plain":       { icon: "📝", label: "TXT",   color: "bg-slate-500/10 text-slate-400 border-slate-500/20" },
    "application/msword":                                                       { icon: "📘", label: "DOC", color: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20" },
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document":   { icon: "📘", label: "DOCX", color: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20" },
    "application/vnd.ms-excel":                                                 { icon: "📊", label: "XLS", color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":         { icon: "📊", label: "XLSX", color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
};

const getFileInfo = (mimetype) =>
    FILE_TYPE_MAP[mimetype] || { icon: "📎", label: "FILE", color: "bg-slate-500/10 text-slate-400 border-slate-500/20" };

const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export default function AttachmentUpload({ taskId, boardId, attachments = [] }) {
    const fileInputRef = useRef(null);
    const [stagedFiles, setStagedFiles] = useState([]);
    const [isDragOver, setIsDragOver] = useState(false);
    const [error, setError] = useState(null);

    const { mutate: uploadAttachments, isPending: isUploading } = useUploadAttachments();
    const { mutate: deleteAttachment, isPending: isDeleting } = useDeleteAttachment();

    const totalSlots = MAX_FILES - attachments.length;

    // ── Drag-and-Drop handlers ──────────────────────────────────────────
    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragOver(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragOver(false);
        const droppedFiles = Array.from(e.dataTransfer.files);
        addFiles(droppedFiles);
    };

    // ── File selection ──────────────────────────────────────────────────
    const handleFileSelect = (e) => {
        const selected = Array.from(e.target.files || []);
        addFiles(selected);
        // Reset so user can re-select same file
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const addFiles = (newFiles) => {
        setError(null);

        // Check per-file size
        const oversized = newFiles.find((f) => f.size > MAX_SIZE_MB * 1024 * 1024);
        if (oversized) {
            setError(`"${oversized.name}" exceeds the ${MAX_SIZE_MB} MB limit.`);
            return;
        }

        // Check total count
        const remainingSlots = totalSlots - stagedFiles.length;
        if (newFiles.length > remainingSlots) {
            setError(`Can only add ${remainingSlots} more file(s). Task limit is ${MAX_FILES}.`);
            return;
        }

        setStagedFiles((prev) => [...prev, ...newFiles]);
    };

    const removeStagedFile = (index) => {
        setStagedFiles((prev) => prev.filter((_, i) => i !== index));
    };

    // ── Upload handler ──────────────────────────────────────────────────
    const handleUpload = () => {
        if (stagedFiles.length === 0) return;

        uploadAttachments(
            { taskId, files: stagedFiles, boardId },
            {
                onSuccess: () => {
                    setStagedFiles([]);
                    setError(null);
                },
                onError: (err) => {
                    setError(err.response?.data?.message || "Upload failed.");
                },
            }
        );
    };

    // ── Delete handler ──────────────────────────────────────────────────
    const handleDelete = (attachmentId) => {
        deleteAttachment({ taskId, attachmentId });
    };

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <label className="text-[12px] font-bold text-slate-400 uppercase tracking-wider">
                    Attachments
                </label>
                <span className="text-[11px] text-slate-500 font-medium">
                    {attachments.length}/{MAX_FILES}
                </span>
            </div>

            {/* ── Existing attachments ────────────────────────────────── */}
            {attachments.length > 0 && (
                <div className="space-y-1.5">
                    {attachments.map((att) => {
                        const info = getFileInfo(att.mimetype);
                        const isImage = att.mimetype?.startsWith("image/");

                        return (
                            <div
                                key={att._id}
                                className="group flex items-center gap-3 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800/60 hover:border-slate-700 transition-all"
                            >
                                {/* Thumbnail or icon */}
                                {isImage ? (
                                    <a href={att.url} target="_blank" rel="noopener noreferrer">
                                        <img
                                            src={att.url}
                                            alt={att.filename}
                                            className="w-8 h-8 rounded-lg object-cover ring-1 ring-slate-700"
                                        />
                                    </a>
                                ) : (
                                    <span className="text-lg">{info.icon}</span>
                                )}

                                {/* File info */}
                                <div className="flex-1 min-w-0">
                                    <a
                                        href={att.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-[12px] font-medium text-slate-300 hover:text-purple-400 transition-colors truncate block"
                                    >
                                        {att.filename}
                                    </a>
                                    <span className="text-[10px] text-slate-500">
                                        {formatFileSize(att.size)}
                                    </span>
                                </div>

                                {/* Type badge */}
                                <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold border ${info.color}`}>
                                    {info.label}
                                </span>

                                {/* Delete button */}
                                <button
                                    type="button"
                                    onClick={() => handleDelete(att._id)}
                                    disabled={isDeleting}
                                    className="p-1 rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all disabled:opacity-30"
                                    title="Remove attachment"
                                >
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* ── Drop zone (only if there's room for more) ──────────── */}
            {totalSlots > 0 && (
                <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`
                        relative cursor-pointer rounded-xl border-2 border-dashed px-4 py-5 text-center
                        transition-all duration-200
                        ${isDragOver
                            ? "border-purple-500 bg-purple-500/5"
                            : "border-slate-800 hover:border-slate-600 bg-slate-950/50"
                        }
                    `}
                >
                    <svg className="w-6 h-6 mx-auto mb-2 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="text-[12px] font-medium text-slate-400">
                        Drop files here or <span className="text-purple-400 font-semibold">browse</span>
                    </p>
                    <p className="text-[10px] text-slate-500 mt-1">
                        Images, PDFs, Docs, Spreadsheets · Max {MAX_SIZE_MB} MB each
                    </p>
                </div>
            )}

            {/* Hidden file input */}
            <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileSelect}
                className="hidden"
            />

            {/* ── Staged files (selected but not yet uploaded) ────────── */}
            {stagedFiles.length > 0 && (
                <div className="space-y-1.5">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                        Ready to upload
                    </p>
                    {stagedFiles.map((file, index) => {
                        const info = getFileInfo(file.type);
                        return (
                            <div
                                key={`${file.name}-${index}`}
                                className="flex items-center gap-3 px-3 py-2 rounded-xl bg-purple-500/5 border border-purple-500/15"
                            >
                                <span className="text-lg">{info.icon}</span>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[12px] font-medium text-slate-300 truncate">{file.name}</p>
                                    <span className="text-[10px] text-slate-500">{formatFileSize(file.size)}</span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => removeStagedFile(index)}
                                    className="p-1 rounded text-slate-500 hover:text-red-400 transition-colors"
                                >
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        );
                    })}

                    <button
                        type="button"
                        onClick={handleUpload}
                        disabled={isUploading}
                        className="w-full mt-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-[12px] font-bold shadow-lg shadow-purple-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        {isUploading ? (
                            <span className="flex items-center justify-center gap-2">
                                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Uploading {stagedFiles.length} file{stagedFiles.length > 1 ? "s" : ""}...
                            </span>
                        ) : (
                            `Upload ${stagedFiles.length} file${stagedFiles.length > 1 ? "s" : ""}`
                        )}
                    </button>
                </div>
            )}

            {/* ── Error display ───────────────────────────────────────── */}
            {error && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium">
                    {error}
                </div>
            )}
        </div>
    );
}
