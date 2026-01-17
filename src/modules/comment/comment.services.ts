
const createComment=(payload:{
    content:string,
    authorId:string,
    postId:string,
    parentId?:string
})=>{
    console.log("crete comment!",payload);
}

export const commentServices={
    createComment
}