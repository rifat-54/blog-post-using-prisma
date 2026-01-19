import { Router } from "express";
import { commentController } from "./comment.controller";
import auth, { userRole } from "../../middleware/auth";

const router=Router()

router.get("/author/:authorId",commentController.getCommentByAuthor)

router.get("/:commentId",commentController.getCommentById)

router.post("/",auth(userRole.ADMIN,userRole.USER),commentController.createComment)

router.delete("/:commentId",auth(userRole.ADMIN,userRole.USER),commentController.deleteCommentById)

router.patch("/:commentId",auth(userRole.ADMIN,userRole.USER),commentController.updateComment)

router.patch("/:commentId/modarate",auth(userRole.ADMIN),commentController.modarateComment)

export const commentRouter=router;