import { Router } from "express";
import { registerUser, loginUser, logoutUser, refreshAccessToken, getCurrentUser, changePassword } from "./auth.controller.js";
import { verifyJWT } from "./auth.middleware.js";
import {
    createWorkspace,
    getUserWorkspaces,
    getWorkspaceById,
    updateWorkspace,
    archiveWorkspace,
    inviteMember,
    removeMember,
    updateMemberRole,
} from "./workspace.controller.js";
import { workspaceAccess } from "./workspace.middleware.js";
import { authorizeWorkspaceRole } from "../../middleware/rbac.middleware.js";

const router = Router();
router.use(verifyJWT)

router.post("/", createWorkspace);

router.get("/", getUserWorkspaces);

router.get("/:workspaceId", workspaceAccess, getWorkspaceById);

router.put("/:workspaceId", workspaceAccess, authorizeWorkspaceRole("admin", "owner"), updateWorkspace);

router.delete("/:workspaceId", workspaceAccess, authorizeWorkspaceRole("admin", "owner"), archiveWorkspace);

router.post("/:workspaceId/members", workspaceAccess, authorizeWorkspaceRole("admin", "owner"), inviteMember);


router.delete("/:workspaceId/members/:memberId", workspaceAccess, authorizeWorkspaceRole("admin", "owner"), removeMember);

router.put("/:workspaceId/members/:memberId", workspaceAccess, authorizeWorkspaceRole("admin", "owner"), updateMemberRole);


export default router;
