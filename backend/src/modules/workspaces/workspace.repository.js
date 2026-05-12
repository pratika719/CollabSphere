import Workspace from "../../models/Workspace.js";
import Member from "../../models/Member.js";
import ApiResponse from "../../utils/ApiResponse.js";
import ApiError from "../../utils/ApiError.js";


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
    return (await Workspace.find({ "members.user": userId }).populate("owner", "name email avatar")).toSorted({ updatedAt: -1 });

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
