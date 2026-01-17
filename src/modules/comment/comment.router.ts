import { Router } from "express";
import { commentController } from "./comment.controller";
import auth, { userRole } from "../../middleware/auth";

const router=Router()

router.get("/author/:authorId",commentController.getCommentByAuthor)
router.get("/:commentId",commentController.getCommentById)
router.post("/",auth(userRole.ADMIN,userRole.USER),commentController.createComment)

export const commentRouter=router;