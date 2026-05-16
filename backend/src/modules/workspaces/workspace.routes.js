import { Router } from "express";

import { verifyJWT } from "../auth/auth.middleware.js";
import {
    createWorkspace,
    getWorkspaces,
    getworkspaceById,
    updatedWorkspace,
    archiveWorkspace,
    inviteMember,
    removeMember,
    updateMemberRole,
    listmembers
} from "./workspace.controller.js";
import { workspaceAccess } from "./workspace.middleware.js";
import { authorizeWorkspaceRole } from "../../middleware/rbac.middleware.js";

const router = Router();
router.use(verifyJWT)

router.post("/", createWorkspace);

router.get("/", getWorkspaces);

router.get("/:workspaceId", workspaceAccess, getworkspaceById);

router.put("/:workspaceId", workspaceAccess, authorizeWorkspaceRole("admin", "owner"), updatedWorkspace);

router.delete("/:workspaceId", workspaceAccess, authorizeWorkspaceRole("admin", "owner"), archiveWorkspace);

router.post("/:workspaceId/members/invite", workspaceAccess, authorizeWorkspaceRole("admin", "owner"), inviteMember);


router.delete("/:workspaceId/members/:memberId", workspaceAccess, authorizeWorkspaceRole("admin", "owner"), removeMember);

router.put("/:workspaceId/members/:memberId", workspaceAccess, authorizeWorkspaceRole("admin", "owner"), updateMemberRole);

router.get("/:workspaceId/members", workspaceAccess, listmembers)

export default router;
