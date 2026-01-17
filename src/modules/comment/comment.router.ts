import { Router } from "express";
import { commentController } from "./comment.controller";
import auth, { userRole } from "../../middleware/auth";

const router=Router()

router.post("/",auth(userRole.ADMIN,userRole.USER),commentController.createComment)

export const commentRouter=router;