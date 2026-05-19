import { Router } from "express";

import {
    createTask,
    getTaskById,
    getTasksByBoard,
    updateTask,
    archiveTask,
    moveTask,
    reorderTasks,
    getFilteredTasks,
} from "./task.controller.js";

import {
    verifyJWT,
} from "../auth/auth.middleware.js";

import {
    workspaceAccess,
} from "../workspaces/workspace.middleware.js";

import {
    authorizeWorkspaceRole,
} from "../../middleware/rbac.middleware.js";

import {
    boardAccess,
} from "../boards/board.middleware.js";

import {
    taskAccess,
} from "./task.middlewares.js";

/*
|--------------------------------------------------------------------------
| TASK ROUTER
|--------------------------------------------------------------------------
|
| Base Route:
| /api
|
| Responsibilities:
| - Define task routes
| - Apply authentication
| - Apply RBAC
| - Apply resource access middleware
|
*/

const router = Router();

/*
|--------------------------------------------------------------------------
| ALL ROUTES REQUIRE AUTHENTICATION
|--------------------------------------------------------------------------
*/

router.use(verifyJWT);

/*
|--------------------------------------------------------------------------
| BOARD TASK ROUTES
|--------------------------------------------------------------------------
*/

/**
 * @route
 * POST /api/boards/:boardId/tasks
 *
 * @desc    Create task
 * @access  Private
 */
router.post(
    "/boards/:boardId/tasks",

    boardAccess,

    authorizeWorkspaceRole(
        "admin",
        "member"
    ),

    createTask
);

/**
 * @route
 * GET /api/boards/:boardId/tasks
 *
 * @desc    Get board tasks
 * @access  Private
 */
router.get(
    "/boards/:boardId/tasks",

    boardAccess,

    getTasksByBoard
);

/*
|--------------------------------------------------------------------------
| SINGLE TASK ROUTES
|--------------------------------------------------------------------------
*/

/**
 * @route
 * GET /api/tasks/:taskId
 *
 * @desc    Get task by ID
 * @access  Private
 */
router.get(
    "/tasks/:taskId",

    taskAccess,

    getTaskById
);

/**
 * @route
 * PUT /api/tasks/:taskId
 *
 * @desc    Update task
 * @access  Private
 */
router.put(
    "/tasks/:taskId",

    taskAccess,

    authorizeWorkspaceRole(
        "admin",
        "member"
    ),

    updateTask
);

/**
 * @route
 * DELETE /api/tasks/:taskId
 *
 * @desc    Archive task
 * @access  Private
 */
router.delete(
    "/tasks/:taskId",

    taskAccess,

    authorizeWorkspaceRole(
        "admin",
        "member"
    ),

    archiveTask
);

/*
|--------------------------------------------------------------------------
| TASK MOVEMENT ROUTES
|--------------------------------------------------------------------------
*/

/**
 * @route
 * PATCH /api/tasks/:taskId/move
 *
 * @desc    Move task between boards
 * @access  Private
 */
router.patch(
    "/tasks/:taskId/move",

    taskAccess,

    authorizeWorkspaceRole(
        "admin",
        "member"
    ),

    moveTask
);

/**
 * @route
 * PATCH /api/boards/:boardId/tasks/reorder
 *
 * @desc    Reorder tasks inside board
 * @access  Private
 */
router.patch(
    "/boards/:boardId/tasks/reorder",

    boardAccess,

    authorizeWorkspaceRole(
        "admin",
        "member"
    ),

    reorderTasks
);

/*
|--------------------------------------------------------------------------
| FILTER / SEARCH / PAGINATION
|--------------------------------------------------------------------------
*/

/**
 * @route
 * GET /api/workspaces/:workspaceId/tasks
 *
 * @desc    Filter/search tasks
 * @access  Private
 *
 * Query Examples:
 * ?priority=high
 * ?assignedTo=userId
 * ?search=auth
 * ?page=1&limit=10
 * ?sortBy=dueDate
 */
router.get(
    "/workspaces/:workspaceId/tasks",

    workspaceAccess,

    getFilteredTasks
);

export default router;