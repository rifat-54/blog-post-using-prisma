import express, { NextFunction, Request, Response } from "express";
import { postController } from "./post.controller";
import auth, { userRole } from "../../middleware/auth";

const router=express.Router()

router.get("/",postController.getAllPost)
router.post("/",auth(userRole.USER),postController.createPost)


export const postRouter=router;