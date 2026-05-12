import asynchandler from "../../utils/asyncHandler.js";
import ApiError from "../../utils/ApiError.js";
import ApiResponse from "../../utils/ApiResponse.js";
import * as workspaceService from "./workspace.service.js";

export const createWorkspace = asynchandler(async (req, res, next) => {

    const { name, description } = req.body;

    const workspace = await workspaceService.createWorkspace({ name, description, ownerId: req.user._id });


    return res.status(201).json(
        new ApiResponse(
            201,
            workspace,
            "Workspace created successfully"
        )
    );

});


export const getWorkspaces = asynchandler(async (req, res, next) => {

    const workspaces = await workspaceService.getWorkspaces({ userId: req.user._id });

    return res.status(200).json(
        new ApiResponse(
            200,
            workspaces,
            "Workspaces fetched successfully"
        )
    );
})

export const getworkspaceById = asynchandler(async (req, res, next) => {
    const { workspaceId } = req.params;
    const workspace = await workspaceService.getWorkspaceById(workspaceId);
    return res.status(200).json(
        new ApiResponse(
            200,
            workspace,
            "Workspace fetched successfully"
        )
    );
})

export const updatedWorkspace = asynchandler(async (req, res, next) => {
    const { workspaceId } = req.params;
    if (
        Object.keys(req.body).length ===
        0
    ) {
        throw new ApiError(
            400,
            "Update data is required"
        );
    }
    const { updateData } = req.body;
    const workspace = await workspaceService.updateWorkspace(workspaceId, updateData);
    return res.status(200).json(
        new ApiResponse(
            200,
            workspace,
            "Workspace updated successfully"
        )
    );
})

export const archiveWorkspace = asynchandler(async (req, res, next) => {
    const { workspaceId } = req.params;
    const workspace = await workspaceService.archiveWorkspace(workspaceId);
    return res.status(200).json(
        new ApiResponse(
            200,
            workspace,
            "Workspace archived successfully"
        )
    );
})

export const inviteMember = asynchandler(async (req, res, next) => {
    const { workspaceId } = req.params;
    const { email, role } = req.body;
    if (!email) {
        throw new ApiError(
            400,
            "Member email is required"
        );
    }

    const workspace = await workspaceService.inviteMember(workspaceId, email, role);
    return res.status(200).json(
        new ApiResponse(
            200,
            workspace,
            "Member invited successfully"
        )
    );
})

export const updateMemberRole = asynchandler(async (req, res, next) => {
    const { workspaceId } = req.params;
    const { email, role } = req.body;
    if (!email || !role) {
        throw new ApiError(
            400,
            "Email and role are required"
        );
    }

    const workspace = await workspaceService.updateRole(workspaceId, email, role);
    return res.status(200).json(
        new ApiResponse(
            200,
            workspace,
            "Role updated successfully"
        )
    );
})

export const removeMember = asynchandler(async (req, res) => {
    const { memberId } = req.params;

    /*
    |--------------------------------------------------------------------------
    | Remove Member
    |--------------------------------------------------------------------------
    */

    const updatedWorkspace = await workspaceService.removeMember({
        workspace: req.workspace,
        memberId,
    });

    return res.status(200).json(
        new ApiResponse(
            200,
            updatedWorkspace,
            "Member removed successfully"
        )
    );
});
