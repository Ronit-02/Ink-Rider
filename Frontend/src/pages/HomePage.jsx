import { useSelector } from "react-redux";
import AllPostSection from "../components/AllPostSection";
import FollowedAuthorsPosts from "../components/FollowedAuthorsPosts";
import { useQuery } from "@tanstack/react-query";
import fetchUser from "../api/fetchUser";

const HomePage = () => {

  const token = useSelector(state => state.auth.token);
  const email = useSelector(state => state.auth.email);

  // no token -> no followed user
  // fetch username data
  // data.following.length !== 0 -> call followed authors famous pots 
  // interests.length !==0 -> initersts posts

  // Fetching User
  const { data: userData, isLoading: fetchUserIsLoading} = useQuery({
    queryKey: ["user", email],
    queryFn: fetchUser,
    enabled: !!email,
    retry: 1   // for faster load
  })
  
  if(fetchUserIsLoading) return <div>Loading...</div>

  return (
    <div className="flex flex-col w-full gap-12">
      <AllPostSection />
      {
        token && userData.following && userData.following.length !== 0 && <FollowedAuthorsPosts />
      }
    </div>
  );
};

export default HomePage;