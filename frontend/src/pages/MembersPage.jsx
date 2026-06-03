import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import useWorkspaceStore from "../store/workspace.store.js";
import { useWorkspace, useInviteMember, useRemoveMember, useUpdateMemberRole } from "../hooks/useWorkspaces.js";
import useAuthStore from "../store/auth.store.js";
import ConfirmDialog from "../components/modals/ConfirmDialog.jsx";
import { useOnlineUsers } from "../realtime/useOnlineUsers.js";
import { useWorkspaceSocket } from "../realtime/useWorkspaceSocket.js";
import UserAvatar from "../components/common/UserAvatar.jsx";

/*
|--------------------------------------------------------------------------
| MEMBERS PAGE — Workspace Member Management
|--------------------------------------------------------------------------
|
| Route: /workspaces/:workspaceId/members
|
| Features:
| - List all members with role badges
| - Invite new member by email
| - Change member role (admin / member)
| - Remove member with confirmation
|
*/

export default function MembersPage() {
    const { workspaceId } = useParams();
    const { setCurrentWorkspace } = useWorkspaceStore();
    const { user: currentUser } = useAuthStore();

    useWorkspaceSocket(workspaceId);
    const { onlineUserIds } = useOnlineUsers(workspaceId);

    // Sync workspace selection
    useEffect(() => {
        if (workspaceId) setCurrentWorkspace(workspaceId);
    }, [workspaceId, setCurrentWorkspace]);

    const { data: workspaceResponse, isLoading } = useWorkspace(workspaceId);
    const workspace = workspaceResponse?.data;
    const members = workspace?.members || [];

    // Invite form state
    const [inviteEmail, setInviteEmail] = useState("");
    const [inviteRole, setInviteRole] = useState("member");
    const [inviteError, setInviteError] = useState("");
    const [inviteSuccess, setInviteSuccess] = useState("");

    // Remove member state
    const [memberToRemove, setMemberToRemove] = useState(null);

    const { mutate: inviteMember, isPending: isInviting } = useInviteMember();
    const { mutate: removeMember, isPending: isRemoving } = useRemoveMember();
    const { mutate: updateMemberRole, isPending: isUpdatingRole } = useUpdateMemberRole();

    // Determine current user's role in this workspace
    const currentUserRole = members.find(
        (m) => (m.user?._id || m.user)?.toString() === currentUser?._id?.toString()
    )?.role;
    const isAdmin = currentUserRole === "admin" || workspace?.owner?.toString() === currentUser?._id?.toString();

    const handleInvite = (e) => {
        e.preventDefault();
        setInviteError("");
        setInviteSuccess("");

        if (!inviteEmail.trim()) {
            setInviteError("Email is required");
            return;
        }

        inviteMember(
            { workspaceId, email: inviteEmail.trim(), role: inviteRole },
            {
                onSuccess: () => {
                    setInviteEmail("");
                    setInviteRole("member");
                    setInviteSuccess("Member invited successfully!");
                    setTimeout(() => setInviteSuccess(""), 3000);
                },
                onError: (error) => {
                    setInviteError(error.response?.data?.message || "Failed to invite member");
                },
            }
        );
    };

    const handleRemove = () => {
        if (!memberToRemove) return;
        removeMember(
            { workspaceId, memberId: (memberToRemove.user?._id || memberToRemove.user) },
            {
                onSuccess: () => setMemberToRemove(null),
            }
        );
    };

    const handleRoleChange = (member, newRole) => {
        updateMemberRole({
            workspaceId,
            memberId: (member.user?._id || member.user),
            role: newRole,
        });
    };

    const getRoleColor = (role) => {
        switch (role) {
            case "admin":
                return "text-purple-400 bg-purple-500/10 border-purple-500/20";
            case "owner":
                return "text-amber-400 bg-amber-500/10 border-amber-500/20";
            default:
                return "text-slate-400 bg-slate-500/10 border-slate-500/20";
        }
    };

    if (isLoading) {
        return (
            <div className="space-y-6 animate-pulse">
                <div className="h-8 bg-slate-800 rounded w-1/3" />
                <div className="h-4 bg-slate-800/60 rounded w-1/2" />
                <div className="space-y-3 mt-8">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-16 rounded-2xl bg-white/[0.02] border border-slate-800/60" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 text-left">
            {/* Header */}
            <div className="pb-4 border-b border-slate-800/40">
                <h1 className="text-2xl font-extrabold text-white tracking-tight">
                    Members
                </h1>
                <p className="text-[13px] text-slate-400 mt-1">
                    Manage members of <span className="text-slate-300 font-semibold">{workspace?.name || "..."}</span>
                    <span className="text-slate-500"> · {members.length} member{members.length !== 1 ? "s" : ""}</span>
                </p>
            </div>

            {/* Invite Member Section */}
            {isAdmin && (
                <div className="p-5 rounded-2xl bg-white/[0.02] border border-slate-800/60 space-y-4">
                    <h3 className="text-[14px] font-bold text-white flex items-center gap-2">
                        <svg className="w-4 h-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                        </svg>
                        Invite Member
                    </h3>
                    <form onSubmit={handleInvite} className="flex items-end gap-3">
                        <div className="flex-1 space-y-1.5">
                            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                Email Address
                            </label>
                            <input
                                type="email"
                                value={inviteEmail}
                                onChange={(e) => setInviteEmail(e.target.value)}
                                placeholder="colleague@example.com"
                                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-[13px] font-medium placeholder:text-slate-600 focus:outline-none focus:border-purple-500/40 focus:ring-1 focus:ring-purple-500/20 transition-all duration-200"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                Role
                            </label>
                            <select
                                value={inviteRole}
                                onChange={(e) => setInviteRole(e.target.value)}
                                className="px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-[13px] font-medium focus:outline-none focus:border-purple-500/40 transition-all duration-200 appearance-none cursor-pointer [color-scheme:dark]"
                            >
                                <option value="member">Member</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>
                        <button
                            type="submit"
                            disabled={!inviteEmail.trim() || isInviting}
                            className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-[13px] font-semibold shadow-lg shadow-purple-500/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                        >
                            {isInviting ? "Inviting..." : "Invite"}
                        </button>
                    </form>

                    {/* Feedback messages */}
                    {inviteError && (
                        <p className="text-[12px] text-red-400 font-medium flex items-center gap-1.5">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {inviteError}
                        </p>
                    )}
                    {inviteSuccess && (
                        <p className="text-[12px] text-emerald-400 font-medium flex items-center gap-1.5">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {inviteSuccess}
                        </p>
                    )}
                </div>
            )}

            {/* Members List */}
            <div className="space-y-2">
                {members.map((member, index) => {
                    const memberUser = member.user || {};
                    const memberId = memberUser._id || memberUser;
                    const memberName = memberUser.name || "Unknown";
                    const memberEmail = memberUser.email || "";
                    const memberRole = member.role || "member";
                    const isOwner = workspace?.owner?.toString() === memberId?.toString();
                    const isCurrentUser = currentUser?._id?.toString() === memberId?.toString();
                    const isOnline = onlineUserIds.has(memberId?.toString());

                    return (
                        <div
                            key={memberId || index}
                            className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.02] border border-slate-800/60 hover:border-slate-700/60 hover:bg-white/[0.03] transition-all duration-200 group"
                        >
                            {/* Avatar */}
                            <UserAvatar 
                                user={memberUser} 
                                size="w-10 h-10" 
                                fontSize="text-sm" 
                                className={isOnline ? "ring-2 ring-emerald-400/70 ring-offset-2 ring-offset-slate-950" : ""}
                            />

                            {/* Name & Email */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <p className="text-[14px] font-semibold text-white truncate capitalize">
                                        {memberName}
                                    </p>
                                    {isCurrentUser && (
                                        <span className="text-[9px] font-bold text-slate-500 bg-slate-800 px-1.5 py-0.5 rounded">
                                            YOU
                                        </span>
                                    )}
                                    {isOnline && (
                                        <span className="text-[9px] font-bold text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded">
                                            ONLINE
                                        </span>
                                    )}
                                </div>
                                <p className="text-[12px] text-slate-500 truncate">{memberEmail}</p>
                            </div>

                            {/* Role badge */}
                            <div className="flex items-center gap-2">
                                {isOwner ? (
                                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase border ${getRoleColor("owner")}`}>
                                        Owner
                                    </span>
                                ) : isAdmin && !isCurrentUser ? (
                                    <select
                                        value={memberRole}
                                        onChange={(e) => handleRoleChange(member, e.target.value)}
                                        disabled={isUpdatingRole}
                                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase border ${getRoleColor(memberRole)} bg-transparent cursor-pointer focus:outline-none appearance-none [color-scheme:dark]`}
                                    >
                                        <option value="member">Member</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                ) : (
                                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase border ${getRoleColor(memberRole)}`}>
                                        {memberRole}
                                    </span>
                                )}

                                {/* Remove button */}
                                {isAdmin && !isOwner && !isCurrentUser && (
                                    <button
                                        onClick={() => setMemberToRemove(member)}
                                        className="p-1.5 rounded-lg text-slate-600 opacity-0 group-hover:opacity-100 hover:text-red-400 hover:bg-red-500/10 transition-all duration-150"
                                        title="Remove member"
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7a4 4 0 11-8 0 4 4 0 018 0zM9 14a6 6 0 00-6 6v1h12v-1a6 6 0 00-6-6zM21 12h-6" />
                                        </svg>
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}

                {members.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-16 px-4 rounded-2xl bg-white/[0.01] border border-dashed border-slate-800/60">
                        <p className="text-[13px] text-slate-500 font-medium">No members found.</p>
                    </div>
                )}
            </div>

            {/* Remove Member Confirm Dialog */}
            <ConfirmDialog
                isOpen={!!memberToRemove}
                onClose={() => setMemberToRemove(null)}
                onConfirm={handleRemove}
                title="Remove Member"
                message={`Are you sure you want to remove "${memberToRemove?.user?.name || "this member"}" from the workspace?`}
                confirmLabel="Remove"
                isPending={isRemoving}
            />
        </div>
    );
}
