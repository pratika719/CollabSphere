import mongoose from "mongoose";
import Workspace from "../../models/Workspace.js";
import ApiError from "../../utils/ApiError.js";


export const addMemberToWorkspace =
    async (
        workspaceId,
        userId,
        role
    ) => {
        return await Workspace.findByIdAndUpdate(
            workspaceId,
            {
                $push: {
                    members: {
                        user: userId,
                        role: role,
                    },
                },
            },
            {
                new: true,
                runValidators: true,
            }
        )
            .populate(
                "owner",
                "name email avatar"
            )
            .populate(
                "members.user",
                "name email avatar"
            );
    };


export const createworkspace = async (workspaceData) => {
    return await Workspace.create(workspaceData);
}

export const findworkspacebyid = async (workspaceId) => {
    return await Workspace.findById(workspaceId).populate("owner",
        "name email avatar"

    ).populate("members.user", "name email avatar");
}

export const findWorkspaceByIdRaw =
    async (workspaceId) => {
        return await Workspace.findById(workspaceId);
    };

export const findworkspacebyUser = async (userId) => {
    return await Workspace.aggregate([
        {
            $match: {
                "members.user": new mongoose.Types.ObjectId(userId),
                isArchived: false
            }
        },
        {
            $lookup: {
                from: "boards",
                let: { workspaceId: "$_id" },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ["$workspace", "$$workspaceId"] },
                                    { $eq: ["$isArchived", false] }
                                ]
                            }
                        }
                    }
                ],
                as: "boards"
            }
        },
        {
            $addFields: {
                boardCount: { $size: "$boards" }
            }
        },
        {
            $project: {
                boards: 0
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner"
            }
        },
        {
            $unwind: "$owner"
        },
        {
            $project: {
                "owner.password": 0,
                "owner.refreshToken": 0
            }
        },
        {
            $sort: { updatedAt: -1 }
        }
    ]);
}
export const updateWorkspace = async (
    workspaceId,
    updateData
) => {
    return await Workspace.findByIdAndUpdate(
        workspaceId,
        updateData,
        {
            new: true,
            runValidators: true,
        }
    )
        .populate(
            "owner",
            "name email avatar"
        )
        .populate(
            "members.user",
            "name email avatar"
        );
};



export const updateMemberRole =
    async (
        workspaceId,
        memberId,
        role
    ) => {
        return await Workspace.findOneAndUpdate(
            {
                _id: workspaceId,
                "members.user": memberId,
            },
            {
                $set: {
                    "members.$.role": role,
                },
            },
            {
                new: true,
                runValidators: true,
            }
        )
            .populate(
                "owner",
                "name email avatar"
            )
            .populate(
                "members.user",
                "name email avatar"
            );
    };



export const isWorkspaceMember =
    async (
        workspaceId,
        userId
    ) => {
        return await Workspace.exists({
            _id: workspaceId,
            "members.user": userId,
        });
    };



export const getWorkspaceMemberRole =
    async (
        workspaceId,
        userId
    ) => {
        const workspace =
            await Workspace.findOne(
                {
                    _id: workspaceId,
                    "members.user": userId,
                },
                {
                    members: {
                        $elemMatch: {
                            user: userId,
                        },
                    },
                }
            );

        if (
            !workspace ||
            !workspace.members.length
        ) {
            return null;
        }

        return workspace.members[0].role;
    };



export const findMemberInWorkspace =
    async (
        workspaceId,
        userId
    ) => {
        return await Workspace.findOne({
            _id: workspaceId,
            "members.user": userId,
        });
    };




export const countWorkspaceMembers =
    async (workspaceId) => {
        const workspace =
            await Workspace.findById(
                workspaceId
            );

        return workspace?.members?.length || 0;
    };


export const archiveWorkspace =
    async (workspaceId) => {
        return await Workspace.findByIdAndUpdate(
            workspaceId,
            {
                isArchived: true,
            },
            {
                new: true,
            }
        );
    };


export const removeMemberFromWorkspace =
    async (
        workspaceId,
        memberId
    ) => {
        return await Workspace.findByIdAndUpdate(
            workspaceId,
            {
                $pull: {
                    members: {
                        user: memberId,
                    },
                },
            },
            {
                new: true,
                runValidators: true,
            }
        )
            .populate(
                "owner",
                "name email avatar"
            )
            .populate(
                "members.user",
                "name email avatar"
            );
    };


export const listmembers = async (workspaceId) => {

    const workspace = await Workspace.findById(workspaceId)
        .populate("members.user", "name email avatar");


    if (!workspace) {
        throw new ApiError(
            404,
            "Workspace not found"
        );
    }
    return workspace.members;

}
