import asyncHandler from "../utils/asyncHandler.js";
import mongoose from "mongoose";
import ApiError from "../utils/ApiError.js";
import * as workspaceRepository from "../modules/workspaces/workspace.repository.js";

export const authorizeWorkspaceRole =
    (...allowedRoles) =>
        asyncHandler(async (req, res, next) => {
            if (!req.workspaceMember) {
                throw new ApiError(
                    403,
                    "You are not a member of this workspace"
                );
            }

            const currentRole = req.workspaceMember.role;

            if (!allowedRoles.includes(currentRole)) {
                throw new ApiError(
                    403,
                    "You are not authorized to perform this action"
                );
            }

            return next();
        });

export const workspaceOwnerOnly = asyncHandler(async (req, res, next) => {
    if (!req.workspace) {
        throw new ApiError(
            500,
            "Workspace context missing"
        );
    }

    const ownerId = req.workspace.owner._id
        ? req.workspace.owner._id.toString()
        : req.workspace.owner.toString();

    const isOwner = ownerId === req.user._id.toString();
    if (!isOwner) {
        throw new ApiError(403, "You are not the owner of this workspace");
    }

    if (req.workspaceMember) {
        req.workspaceMember.role = "owner";
    }

    next();
});

export const optionalWorkspaceAccess =
    asyncHandler(async (req, res, next) => {
        const { workspaceId } = req.params;

        if (!workspaceId) {
            return next();
        }

        if (
            !mongoose.Types.ObjectId.isValid(
                workspaceId
            )
        ) {
            req.workspace = null;
            req.workspaceMember = null;

            return next();
        }

        const workspace =
            await workspaceRepository.findWorkspaceByIdRaw(
                workspaceId
            );

        if (!workspace) {
            req.workspace = null;
            req.workspaceMember = null;

            return next();
        }

        if (!req.user) {
            req.workspace = workspace;
            req.workspaceMember = null;

            return next();
        }

        const member =
            workspace.members.find(
                (member) =>
                    member.user.toString() ===
                    req.user._id.toString()
            );

        req.workspace = workspace;

        req.workspaceMember =
            member || null;

        next();
    });