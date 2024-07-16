import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import fetchPost from "../api/fetchPost";
import { NavLink, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import addComment from "../api/addComment";
import deleteComment from "../api/deleteComment"
import { useSelector } from "react-redux";
import useNotification from "../components/notification/useNotification";
import likePost from "../api/post/likePost";
import fetchUser from "../api/fetchUser";
import savePost from "../api/post/savePost";
import useModal from "../components/modal/useModal";

const DisplayPostPage = () => {

    // Retrieve
    const email = useSelector(state => state.auth.email);
    const { id: postId } = useParams();

    // Functions
    const { openModal } = useModal();
    const { displayNotification } = useNotification();
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    // States
    const [contentBlocks, setContentBlocks] = useState()
    const [comment, setComment] = useState("");
    const [liked, setLiked] = useState(false)
    const [saved, setSaved] = useState(false);

    
    // Fetching Post
    const { data: postData, isLoading: fetchPostIsLoading, isError, error} = useQuery({
        queryKey: ["post", postId],
        queryFn: fetchPost,
        retry: 1   // limited retries, faster reload
    });
    

    // Fetching Body - Content Blocks
    useEffect(() => {
        if(postData?.body){
            setContentBlocks(JSON.parse(postData.body))
        }
    }, [postData]);


    // Fetching User
    const { data: userData, isLoading: fetchUserIsLoading} = useQuery({
        queryKey: ["user", email],
        queryFn: fetchUser,
        enabled: !!email,
        // retry: 1
    });


    // Incorrect postId
    useEffect(() => {
        if(error?.response?.status === 500){
            navigate('/404');
        }
    }, [error, navigate])


    // Adding Comment
    const { mutate: addCommentMutate, isLoading: addCommentIsLoading } = useMutation({
        mutationFn: addComment,
        onSuccess: (response, {postId}) => {
            setComment('')
            displayNotification(response.message);
            queryClient.invalidateQueries(['post', postId]);
        },
        onError: (error) => {
            displayNotification(error?.response?.data?.message || error.message, 'error');
        },
    });


    // Deleting Comment
    const { mutate: deleteCommentMutate, isLoading: deleteCommentIsLoading } = useMutation({
        mutationFn: deleteComment,
        onSuccess: (response, {postId}) => {
            displayNotification(response.message);
            queryClient.invalidateQueries(['post', postId]);
        },
        onError: (error) => {
            displayNotification(error?.response?.data?.message || error.message, 'error');
        }
    });


    // Liking-Unliking Post
    const { mutate: likePostMutate, isLoading: likePostIsLoading } = useMutation({
        mutationFn: likePost,
        onSuccess: (response) => {
            displayNotification(response.message);
            queryClient.invalidateQueries(['post', postId]);
        },
        onError: (error) => {
            displayNotification(error?.response?.data?.message || error.message, 'error');
        }
    })


    // Saving-Unsaving Post
    const { mutate: savePostMutate, isLoading: savePostLoading } = useMutation({
        mutationFn: savePost,
        onSuccess: (response) => {
            displayNotification(response.message);
            queryClient.invalidateQueries(['post', postId]);
        },
        onError: (error) => {
            displayNotification(error?.response?.data?.message || error.message, 'error');
        }
    })


    // Button Hanlders
    const postComment = () => {
        addCommentMutate({ postId, comment });
    };
    const removeComment = (commentId) => {
        deleteCommentMutate({ postId, commentId: commentId });
    }
    const handleLikeUnlikePost = () => {
        if(!email){
            openModal({
                title: "Login First",
                message: "You need to login to like this article",
                onConfirm: () => {
                    return navigate('/login');
                },
                confirmText: "login",
                onCancel: () => {
                    return null;
                }
            })
        }
        else
            likePostMutate({postId});
    }
    const handleSaveUnsavePost = () => {  
        savePostMutate({postId});
    }


    // Changing States on render
    useEffect(() => {
        if(userData?.liked?.includes(postId))
            setLiked(true);
        else
            setLiked(false);

    }, [userData, postId]);
    useEffect(() => {
        if(userData?.saved?.includes(postId))
            setSaved(true);
        else
            setSaved(false)

    }, [userData, postId]);


    // Conditional Rendering
    if (fetchPostIsLoading || fetchUserIsLoading) return <div>Loading...</div>;
    if (isError) return <div>{error?.response?.data?.message || error.message}</div>;

    return (
    <div className="flex flex-col w-full max-w-3xl gap-4 ml-auto mr-auto">
        <div className="flex gap-4">
            {liked === false ? 
            <button onClick={handleLikeUnlikePost} disabled={likePostIsLoading}>Like</button> :
            <button onClick={handleLikeUnlikePost} disabled={likePostIsLoading}>UnLike</button>}
            {saved === false ?
            <button onClick={handleSaveUnsavePost} disabled={savePostLoading}>Save</button> :
            <button onClick={handleSaveUnsavePost} disabled={savePostLoading}>Unsave</button>}
        </div>
        <img
            className="w-full h-[300px] object-cover"
            src={postData.coverImage}
            alt="cover-image"
        />
        <h1 className="items-center text-3xl text-center capitalize">
            {postData.title}
        </h1>
        <p className="text-sm text-gray-500">{postData?.likes} likes</p>
        <p className="text-sm text-gray-500">{postData?.metadata?.views} views</p>
        <p className="text-sm text-gray-500">{postData?.metadata?.shares} shares</p>
        <p>{ new Date(postData?.createdAt).toLocaleString('en-GB', {day:'numeric', month: 'long', year:'numeric'})}</p>
        <NavLink to={`/user/${postData.author._id}`} className="flex items-center gap-2 ml-auto">
            <img className="w-8 h-8 rounded-full" src={postData.author.picture} alt="author-pic" />
            <h3 className="text-xl capitalize">{postData.author.username}</h3>
        </NavLink>
      
        
        {/* BODY SECTION */}

        <div className="flex flex-col w-full gap-8">
            {contentBlocks &&
            contentBlocks.map((block) => {
                return (
                    <div key = {block.id} className="relative w-full">
                        {
                            block.type === 'heading'
                            ?
                            <h1 className="w-full text-3xl font-semibold h-fit">
                                {block.text}
                            </h1>
                            :
                            <p className="w-full text-base h-fit">
                                {block.text}
                            </p>
                        }
                    </div>
                )
            })}
        </div>
        

        {/* COMMENTS SECTION */}

        <section className="flex flex-col w-full gap-4 mt-12">
            <h1 className="text-2xl">Comments Section</h1>

            {/* Post Comment */}

            <div className="flex w-full gap-4">
                <input
                    className="flex-auto p-2 border"
                    placeholder="add your comment..."
                    type="text"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                />
                <button
                    className="rounded-lg w-[50px] flex-none p-2 text-white bg-blue-500"
                    onClick={postComment}
                    disabled={addCommentIsLoading}>
                    Post
                </button>
            </div>

            {/* Load Comments */}

            {postData.comments[0] ? (
                <ul className="flex flex-col gap-6 mt-4">
                    {postData.comments.map((item) => (
                        <li key={item._id}>

                            <div className="flex flex-row gap-4">

                                {/* Comment Body */}

                                <div className="flex items-start flex-auto gap-4">
                                    <NavLink to={`/user/${item.author._id}`}>
                                        <img className="w-8 h-8 rounded-full" src={item.author.picture} alt="author-pic" />
                                    </NavLink>
                                    <div className="flex flex-col gap-1">
                                        <p className="text-sm">@{item.author.username}</p>
                                        <p className="text-md">{item.comment}</p>
                                    </div>
                                </div>

                                {/* Delete Comment */}

                                {item.author.email === email &&
                                <button
                                    onClick={() => removeComment(item._id)} 
                                    className="text-sm w-[50px] flex-none text-red-500"
                                    disabled={deleteCommentIsLoading}>
                                    Delete
                                </button>}

                                
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