import ApiError from "../../utils/ApiError.js";

import * as workspaceRepository from "./workspace.repository.js";
import * as authRepository from "../auth/auth.repository.js";
import { notifyUser } from "../notifications/notification.service.js";

/*
|--------------------------------------------------------------------------
| WORKSPACE SERVICE
|--------------------------------------------------------------------------
|
| Responsibilities:
| - Business workflows
| - Validation logic
| - Workspace operations
| - Member management
|
| Services SHOULD NOT:
| - Handle req/res
| - Handle RBAC authorization
| - Validate JWT
|
| RBAC is handled by middleware.
|
*/

/*
|--------------------------------------------------------------------------
| CREATE WORKSPACE
|--------------------------------------------------------------------------
*/

export const createWorkspace = async ({
    name,
    description,
    ownerId,
}) => {
    /*
    |--------------------------------------------------------------------------
    | Validation
    |--------------------------------------------------------------------------
    */

    if (!name?.trim()) {
        throw new ApiError(
            400,
            "Workspace name is required"
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Create Workspace
    |--------------------------------------------------------------------------
    */

    const workspace =
        await workspaceRepository.createworkspace({
            name,
            description,

            owner: ownerId,

            /*
            |--------------------------------------------------------------------------
            | Owner automatically added as admin
            |--------------------------------------------------------------------------
            */

            members: [
                {
                    user: ownerId,
                    role: "admin",
                },
            ],
        });

    /*
    |--------------------------------------------------------------------------
    | Return Populated Workspace
    |--------------------------------------------------------------------------
    */

    return await workspaceRepository.findworkspacebyid(
        workspace._id
    );
};

/*
|--------------------------------------------------------------------------
| GET USER WORKSPACES
|--------------------------------------------------------------------------
*/

export const getUserWorkspaces =
    async (userId) => {
        return await workspaceRepository.findworkspacebyUser(
            userId
        );
    };

/*
|--------------------------------------------------------------------------
| GET SINGLE WORKSPACE
|--------------------------------------------------------------------------
|
| Membership already validated in middleware
|
*/

export const getWorkspaceById =
    async (workspaceId) => {
        const workspace =
            await workspaceRepository.findworkspacebyid(
                workspaceId
            );

        if (!workspace) {
            throw new ApiError(
                404,
                "Workspace not found"
            );
        }

        return workspace;
    };

/*
|--------------------------------------------------------------------------
| UPDATE WORKSPACE
|--------------------------------------------------------------------------
|
| RBAC already handled in middleware
|
*/

export const updateWorkspace =
    async ({
        workspaceId,
        updateData,
    }) => {
        /*
        |--------------------------------------------------------------------------
        | Prevent Dangerous Updates
        |--------------------------------------------------------------------------
        */

        delete updateData.owner;

        delete updateData.members;

        /*
        |--------------------------------------------------------------------------
        | Update Workspace
        |--------------------------------------------------------------------------
        */

        const updatedWorkspace =
            await workspaceRepository.updateWorkspace(
                workspaceId,
                updateData
            );

        if (!updatedWorkspace) {
            throw new ApiError(
                404,
                "Workspace not found"
            );
        }

        return updatedWorkspace;
    };

/*
|--------------------------------------------------------------------------
| ARCHIVE WORKSPACE
|--------------------------------------------------------------------------
|
| Owner validation handled in middleware
|
*/

export const archiveWorkspace =
    async (workspaceId) => {
        const archivedWorkspace =
            await workspaceRepository.archiveWorkspace(
                workspaceId
            );

        if (!archivedWorkspace) {
            throw new ApiError(
                404,
                "Workspace not found"
            );
        }

        return archivedWorkspace;
    };

/*
|--------------------------------------------------------------------------
| INVITE MEMBER
|--------------------------------------------------------------------------
|
| Admin authorization already handled in middleware
|
*/

export const inviteMember = async ({
    workspaceId,
    email,
    role = "member",
    inviterId,
    inviterName,
}) => {
    /*
    |--------------------------------------------------------------------------
    | Validate Role
    |--------------------------------------------------------------------------
    */

    const allowedRoles = [
        "admin",
        "member",
    ];

    if (
        !allowedRoles.includes(role)
    ) {
        throw new ApiError(
            400,
            "Invalid role"
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Find User
    |--------------------------------------------------------------------------
    */

    const user =
        await authRepository.finduserByEmail(
            email
        );
    if (!user) {
        throw new ApiError(
            404,
            "User not found"
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Prevent Duplicate Membership
    |--------------------------------------------------------------------------
    */

    const existingMember =
        await workspaceRepository.findMemberInWorkspace(
            workspaceId,
            user._id
        );

    if (existingMember) {
        throw new ApiError(
            409,
            "User already belongs to workspace"
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Add Member
    |--------------------------------------------------------------------------
    */

    const workspace = await workspaceRepository.addMemberToWorkspace(
        workspaceId,
        user._id,
        role
    );

    /*
    |--------------------------------------------------------------------------
    | Notify User
    |--------------------------------------------------------------------------
    */

    await notifyUser({
        userId: user._id,
        type: "WORKSPACE_INVITE",
        message: `${inviterName} invited you to workspace "${workspace.name}"`,
        relatedWorkspace: workspaceId,
        triggeredBy: inviterId,
    });

    return workspace;
};

/*
|--------------------------------------------------------------------------
| REMOVE MEMBER
|--------------------------------------------------------------------------
|
| Admin authorization already handled in middleware
|
*/

export const removeMember = async ({
    workspace,
    memberId,
    removerId,
    removerName,
}) => {
    /*
    |--------------------------------------------------------------------------
    | Prevent Owner Removal
    |--------------------------------------------------------------------------
    */

    if (
        workspace.owner.toString() ===
        memberId.toString()
    ) {
        throw new ApiError(
            400,
            "Workspace owner cannot be removed"
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Check Member Exists
    |--------------------------------------------------------------------------
    */

    const memberExists =
        workspace.members.some(
            (member) =>
                member.user.toString() ===
                memberId.toString()
        );

    if (!memberExists) {
        throw new ApiError(
            404,
            "Member not found in workspace"
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Remove Member
    |--------------------------------------------------------------------------
    */

    const updatedWorkspace = await workspaceRepository.removeMemberFromWorkspace(
        workspace._id,
        memberId
    );

    /*
    |--------------------------------------------------------------------------
    | Notify User
    |--------------------------------------------------------------------------
    */

    await notifyUser({
        userId: memberId,
        type: "WORKSPACE_REMOVED",
        message: `${removerName} removed you from workspace "${workspace.name}"`,
        relatedWorkspace: workspace._id,
        triggeredBy: removerId,
    });

    return updatedWorkspace;
};

/*
|--------------------------------------------------------------------------
| UPDATE MEMBER ROLE
|--------------------------------------------------------------------------
|
| Admin authorization already handled in middleware
|
*/

export const updateMemberRole =
    async ({
        workspace,
        memberId,
        role,
    }) => {
        /*
        |--------------------------------------------------------------------------
        | Validate Role
        |--------------------------------------------------------------------------
        */

        const allowedRoles = [
            "admin",
            "member",
        ];

        if (
            !allowedRoles.includes(role)
        ) {
            throw new ApiError(
                400,
                "Invalid role"
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Prevent Owner Role Change
        |--------------------------------------------------------------------------
        */

        if (
            workspace.owner.toString() ===
            memberId.toString()
        ) {
            throw new ApiError(
                400,
                "Workspace owner role cannot be changed"
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Validate Member Exists
        |--------------------------------------------------------------------------
        */

        const memberExists =
            workspace.members.some(
                (member) =>
                    member.user.toString() ===
                    memberId.toString()
            );

        if (!memberExists) {
            throw new ApiError(
                404,
                "Member not found"
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Update Role
        |--------------------------------------------------------------------------
        */

        return await workspaceRepository.updateMemberRole(
            workspace._id,
            memberId,
            role
        );
    };


export const listmembers = async (workspaceId) => {

    return await workspaceRepository.listmembers(workspaceId);
}