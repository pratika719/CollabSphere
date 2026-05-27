import asyncHandler from "../../utils/asyncHandler.js";
import ApiError from "../../utils/ApiError.js";
import ApiResponse from "../../utils/ApiResponse.js";
import * as workspaceService from "./workspace.service.js";

export const createWorkspace = asyncHandler(async (req, res, next) => {

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


export const getWorkspaces = asyncHandler(async (req, res, next) => {

    const workspaces = await workspaceService.getUserWorkspaces(req.user._id);

    return res.status(200).json(
        new ApiResponse(
            200,
            workspaces,
            "Workspaces fetched successfully"
        )
    );
})

export const getworkspaceById = asyncHandler(async (req, res, next) => {
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

export const updatedWorkspace = asyncHandler(async (req, res, next) => {
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
    const workspace = await workspaceService.updateWorkspace({ workspaceId, updateData });
    return res.status(200).json(
        new ApiResponse(
            200,
            workspace,
            "Workspace updated successfully"
        )
    );
})

export const archiveWorkspace = asyncHandler(async (req, res, next) => {
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

export const inviteMember = asyncHandler(async (req, res, next) => {
    const { workspaceId } = req.params;
    const { email, role } = req.body;
    if (!email) {
        throw new ApiError(
            400,
            "Member email is required"
        );
    }

    const workspace = await workspaceService.inviteMember({
        workspaceId,
        email,
        role,
        inviterId: req.user._id,
        inviterName: req.user.name,
    });
    return res.status(200).json(
        new ApiResponse(
            200,
            workspace,
            "Member invited successfully"
        )
    );
})

export const updateMemberRole = asyncHandler(async (req, res, next) => {
    const { memberId } = req.params;
    const { role } = req.body;
    if (!memberId || !role) {
        throw new ApiError(
            400,
            "Member ID and role are required"
        );
    }

    const workspace = await workspaceService.updateMemberRole({
        workspace: req.workspace,
        memberId,
        role
    });
    return res.status(200).json(
        new ApiResponse(
            200,
            workspace,
            "Role updated successfully"
        )
    );
})

export const removeMember = asyncHandler(async (req, res) => {
    const { memberId } = req.params;

    /*
    |--------------------------------------------------------------------------
    | Remove Member
    |--------------------------------------------------------------------------
    */

    const updatedWorkspace = await workspaceService.removeMember({
        workspace: req.workspace,
        memberId,
        removerId: req.user._id,
        removerName: req.user.name,
    });

    return res.status(200).json(
        new ApiResponse(
            200,
            updatedWorkspace,
            "Member removed successfully"
        )
    );
});


export const listmembers = asyncHandler(async (req, res, next) => {
    const { workspaceId } = req.params;
    const members = await workspaceService.listmembers(workspaceId);
    return res.status(200).json(
        new ApiResponse(
            200,
            members,
            "Members fetched successfully"
        )
    );
})