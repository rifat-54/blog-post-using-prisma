import { Request, Response } from "express";
import { postServices } from "./post.services";


const createPost = async (req: Request, res: Response) => {
  try {
    console.log(req.user);
    if (!req.user) {
      return res.status(400).json({
        error: "failed Post",
      });
    }
    const result = await postServices.createPost(req.body, req.user.id);
    res.status(201).json(result);

  } catch (error) {
    res.status(400).json({
      error: "failed Post",
      details: error,
    });
  }
};

const getAllPost = async (req: Request, res: Response) => {
  try {
    const{search}=req.query
    const searchString=typeof search ==='string'?search :undefined
    const tags=req.query.tags?(req.query.tags as string).split(",") : []

    const result = await postServices.getAllPost({search:searchString,tags})
    res.status(200).json(result);

  } catch (error) {
    res.status(400).json({
        success:false,
        message:"server error",
        details:error
    })
  }
};

export const postController = {
  createPost,
  getAllPost,
};
