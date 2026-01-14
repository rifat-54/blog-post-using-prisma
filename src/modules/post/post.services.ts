import { Post, PostStatus } from "../../../generated/prisma/client";
import { PostWhereInput } from "../../../generated/prisma/models";
import { prisma } from "../../lib/prisma";

const createPost = async (
  data: Omit<Post, "id" | "createdAt" | "updatedAt" | "authorId">,
  userId: string
) => {
  const result = await prisma.post.create({
    data: {
      ...data,
      authorId: userId,
    },
  });
  return result;
};

const getAllPost = async (payload: {
  search: string | undefined
  tags: string[] | []
  isFeatured:boolean | undefined,
  status:PostStatus | undefined,
  authorId:string | undefined
}) => {
  const andCondition:PostWhereInput[]=[]
  if(payload.search){
    andCondition.push(
      {
          OR: [
            {
              title: {
                contains: payload.search as string,
                mode: "insensitive",
              },
            },
            {
              content: {
                contains: payload.search as string,
                mode: "insensitive",
              },
            },
            {
              tags: {
                has: payload.search as string,
              },
            },
          ],
        },
    )
  }
  if(payload.tags){
    andCondition.push(
      {
          tags: {
            hasEvery: payload.tags,
          },
        },
    )
  }

  if(typeof payload.isFeatured ==='boolean'){
    andCondition.push({
      isFeatured:payload.isFeatured
    })
  }

  if(payload.status){
    andCondition.push({
      status:payload.status
    })
  }

if(payload.authorId){
  andCondition.push({
    authorId:payload.authorId
  })
}
  const data = await prisma.post.findMany({
    where: {
      AND: andCondition
    },
  });
  return data;
};

export const postServices = {
  createPost,
  getAllPost,
};
