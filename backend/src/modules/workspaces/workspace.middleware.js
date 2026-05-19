import mongoose from "mongoose";
import ApiError from "../../utils/ApiError.js";
import * as workspaceRepository from "./workspace.repository.js";

import asyncHandler from "../../utils/asyncHandler.js";

export const workspaceAccess =
    asyncHandler(async (req, res, next) => {

        const { workspaceId } =
            req.params;

        if (
            !mongoose.Types.ObjectId.isValid(
                workspaceId
            )
        ) {
            throw new ApiError(
                400,
                "Invalid workspace ID"
            );
        }

        const workspace =
            await workspaceRepository.findWorkspaceByIdRaw(
                workspaceId
            );

        if (!workspace) {
            throw new ApiError(
                404,
                "Workspace not found"
            );
        }

        const member =
            workspace.members.find(
                (member) =>
                    member.user.toString() ===
                    req.user._id.toString()
            );

        if (!member) {
            throw new ApiError(
                403,
                "You are not a member of this workspace"
            );
        }

        req.workspace = workspace;
        req.workspaceMember =
            member;

        next();
    });