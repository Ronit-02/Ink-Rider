import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import fetchPost from "../api/fetchPost";
import { NavLink, useParams } from "react-router-dom";
import { useState } from "react";
import addComment from "../api/addComment";
import deleteComment from "../api/deleteComment"

const DisplayPostPage = () => {
  const queryClient = useQueryClient();
  const { id } = useParams();
  const [comment, setComment] = useState("");
  
  // Fetching Post
  const { data, isLoading: fetchIsLoading, isError, error} = useQuery({
    queryKey: ["post", id],
    queryFn: fetchPost,
  });

  // Adding Comment
  const { mutate: addCommentMutate, isLoading: addCommentIsLoading } = useMutation({
    mutationFn: addComment,
    onSuccess: (response, {postId}) => {
      console.log("Response - ", response);
      queryClient.invalidateQueries(['post', postId]);
    },
    onError: (error) => {
      console.log("Error - ", error?.response?.data?.message);
    },
  });

  // Deleting Comment
  const { mutate: deleteCommentMutate, isLoading: deleteCommentIsLoading } = useMutation({
    mutationFn: deleteComment,
    onSuccess: (response, {postId}) => {
      console.log("Response - ", response);
      queryClient.invalidateQueries(['post', postId]);
    },
    onError: (error) => {
      console.log("Error - ", error?.response?.data?.message);
    }
  });

  // Button Hanlders
  const postComment = () => {
    addCommentMutate({ id, comment });
  };
  const removeComment = (commentId) => {
    deleteCommentMutate({ postId: id, commentId: commentId });
  }

  // Conditional Rendering
  if (fetchIsLoading) return <div>Loading...</div>;
  if (isError) return <div>{error?.response?.data?.message || error.message}</div>;
  else
  return (
    <div className="flex flex-col w-full max-w-3xl gap-4 ml-auto mr-auto">
      <img
        className="w-full h-[300px]"
        src={data.coverImage}
        alt="cover-image"
      />
      <h1 className="items-center text-3xl text-center capitalize">
        {data.title}
      </h1>
      <NavLink to={`/user/${data.author._id}`} className="ml-auto">{data.author.username}</NavLink>
      <p>{data.body}</p>
      <section className="flex flex-col w-full gap-4">
        <h1 className="text-2xl">Comments Section</h1>
        <div className="flex w-full gap-4">
          <input
            className="flex-auto p-2 border"
            type="text"
            placeholder="add your comment..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          <button
            className="rounded-lg w-[50px] flex-none p-2 text-white bg-blue-500"
            onClick={postComment}
            disabled={addCommentIsLoading}
          >
            Post
          </button>
        </div>
        {data.comments[0] ? (
          <ul className="flex flex-col gap-6">
            {data.comments.map((item) => (
              <li key={item._id}>
              <div className="flex flex-row gap-4">
                <div className="flex flex-col flex-auto gap-2">
                  <NavLink to={`/user/${item.author._id}`}>{item.author.username}</NavLink>
                  <p>{item.comment}</p>
                </div>
                {
                  item.author._id === data.author._id &&
                  <button 
                    onClick={() => removeComment(item._id)} 
                    className="text-sm w-[50px] flex-none text-red-500"
                    disabled={deleteCommentIsLoading}>
                    Delete
                  </button>
                }
              </div>
              <hr className="w-full mt-4"/>
              </li>
            ))}
          </ul>
        ) : (
          <p>No comments yet</p>
        )}
      </section>
    </div>
  );
};

export default DisplayPostPage;