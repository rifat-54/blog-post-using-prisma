import express from "express";
import { postController } from "./post.controller";
import auth, { userRole } from "../../middleware/auth";

const router=express.Router()

router.get("/",postController.getAllPost)
router.post("/",auth(userRole.USER,userRole.ADMIN),postController.createPost)
router.get("/mypost",auth(userRole.ADMIN,userRole.USER),postController.getMyPost)
router.get("/:id",postController.getPostById)

router.patch("/:postId",auth(userRole.ADMIN,userRole.USER),postController.updatePost)

export const postRouter=router;