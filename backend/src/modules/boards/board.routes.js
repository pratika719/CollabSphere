import { Router } from "express";
import { verifyJWT } from "../auth/auth.middleware.js";
import { workspaceAccess } from "../workspaces/workspace.middleware.js";
import { authorizeWorkspaceRole } from "../../middleware/rbac.middleware.js";
import { boardAccess } from "./board.middleware.js";
import {
    createBoard,
    getWorkspaceBoards,
    getBoardById,
    updateBoard,
    archiveBoard,
    reorderBoards
} from "./board.controller.js";

const router = Router();
router.use(verifyJWT);

router.post(
    "/workspaces/:workspaceId/boards",
    workspaceAccess,
    authorizeWorkspaceRole("admin", "member"),
    createBoard
);

router.get(
    "/workspaces/:workspaceId/boards",
    workspaceAccess,
    getWorkspaceBoards
);

router.get(
    "/boards/:boardId",
    boardAccess,
    getBoardById
);

router.put(
    "/boards/:boardId",
    boardAccess,
    authorizeWorkspaceRole("admin", "member"),
    updateBoard
);

router.delete(
    "/boards/:boardId",
    boardAccess,
    authorizeWorkspaceRole("admin"),
    archiveBoard
);

router.patch(
    "/workspaces/:workspaceId/boards/reorder",
    workspaceAccess,
    authorizeWorkspaceRole("admin", "member"),
    reorderBoards
);

export default router;
