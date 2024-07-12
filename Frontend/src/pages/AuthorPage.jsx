import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import fetchUserWithPosts from "../api/fetchUserWithPosts";
import PostListCard from "../components/PostListCard";
import profileImage from "../assets/images/Profile-Pic.svg";
import { useEffect, useState } from "react";
import useNotification from "../components/notification/useNotification";
import followUser from "../api/followUser";
import { useSelector } from "react-redux";
import fetchUser from "../api/fetchUser";
import useModal from "../components/modal/useModal";

const AuthorPage = () => {
  const { displayNotification } = useNotification();
  const { openModal } = useModal();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const email = useSelector(state => state.auth.email);
  const { id: userId } = useParams();
  const [follow, setFollow] = useState(false);

  // Fetching Author
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["user", userId],
    queryFn: fetchUserWithPosts,
    retry: 1  // limited retries, faster reload
  });

  // Fetching User
  const { data: userData, isLoading: fetchUserIsLoading} = useQuery({
    queryKey: ["user", email],
    queryFn: fetchUser,
    enabled: !!email,
    // retry: 1
  })

  // Follow-Unfollow User
  const { mutate: followMutate, isLoading: followIsLoading } = useMutation({
    mutationFn: followUser,
    onSuccess: (response) => {
      displayNotification(response.message);
      queryClient.invalidateQueries('user');
    },
    onError: (error) => {
      displayNotification(error?.response?.data?.message || error?.message)
    }
  });

  // Changing States on render
  useEffect(() => {
    if(userData?.following?.includes(userId))
      setFollow(true);
    else
      setFollow(false);
  }, [userData, userId]);

  // Button Handlers
  const handleFollow = () => {
    if(!email){
      openModal({
        title: "Login First",
        message: "You need to login to follow this author",
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
      followMutate({userId});
  }

  // Incorrect userId
  useEffect(() => {
    if (error?.response?.status === 500) {
      navigate("/404");
    }
  }, [error, navigate]);

  // Conditional Rendering
  if (isLoading || fetchUserIsLoading ) return <div>Loading...</div>;
  if (isError)
    return <div>{error?.response?.data?.message || error.message}</div>;
  else
    return (
      <div className="w-full">
        <div className="flex justify-between">
          <div className="flex items-center gap-4">
            <img className="w-16 h-16 rounded-full" src={data.picture || profileImage} alt="profile-pic" />
            <div className="flex flex-col">
              <h1 className="text-2xl capitalize">{data.username}</h1>
              <h3 className="text-sm text-gray-500">{data.role} user</h3>
            </div>
          </div>
          {
            follow === false ? 
            <button onClick={handleFollow} disabled={followIsLoading} className="px-4 py-2 text-white bg-black rounded-3xl">Follow</button>
            : 
            <button onClick={handleFollow} disabled={followIsLoading} className="px-4 py-2 text-white bg-black rounded-3xl">Unfollow</button>
          }
        </div>
        <section className="mt-4">
          <h1 className="text-2xl capitalize">{data.username} Posts</h1>
          <div className="flex flex-row flex-wrap gap-4 mt-6">
            {data.posts &&
              data.posts.map((item) => (
                <PostListCard
                  key={item._id}
                  image={item.coverImage}
                  id={item._id}
                  title={item.title}
                  tags={item.tags}
                  content={item.body}
                  owner={false}
                />
              ))}
            {data.posts[0] === undefined && <div>No posts yet</div>}
          </div>
        </section>
      </div>
    );
};

export default AuthorPage;