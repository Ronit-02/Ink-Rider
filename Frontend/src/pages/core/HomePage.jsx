import { useSelector } from "react-redux";
import { useQuery } from "@tanstack/react-query";
import { useRef, useState } from "react";
import AllPostSection from "../../components/AllPostSection";
import FollowedAuthorsPosts from "../../components/FollowedAuthorsPosts";
import fetchUser from "../../api/user/fetchUser";

// Icons
import { LuSettings2 } from "react-icons/lu";

const HomePage = () => {

    const token = useSelector(state => state.auth.token);
    const email = useSelector(state => state.auth.email);
    const [feed, setFeed] = useState('latest')
    const [filtersMenu, setFiltersMenu] = useState(false);
    const [sort, setSort] = useState('views')
    
    // draggable feed header
    const scrollRef = useRef(null);
    const isDown = useRef(false);
    const startX = useRef(0);
    const scrollLeft = useRef(0);

    // no token -> no followed user
    // fetch username data
    // data.following.length !== 0 -> call followed authors famous pots 
    // interests.length !==0 -> interests posts

    // Fetching User
    const { data: userData, isLoading: fetchUserIsLoading} = useQuery({
        queryKey: ["user", email],
        queryFn: fetchUser,
        enabled: !!email,
        retry: 1 
    })

    // Mouse Events
    const handleMouseDown = (e) => {
        isDown.current = true;
        startX.current = e.pageX - scrollRef.current.offsetLeft;
        scrollLeft.current = scrollRef.current.scrollLeft;
    }
    const handleMouseLeave = () => {
        isDown.current = false;
    }
    const handleMouseUp = () => {
        isDown.current = false;
    }
    const handleMouseMove = (e) => {
        if (!isDown.current) return;
        e.preventDefault();
        const x = e.pageX - scrollRef.current.offsetLeft;
        const walk = (x - startX.current);
        scrollRef.current.scrollLeft = scrollLeft.current - walk;
    }
    
  return (
    <div className="flex flex-col w-full gap-12 px-4">
        
        <div className="flex border-b-[1px] items-center p-4 border-gray-100">
            <div 
                className="flex-1 overflow-x-auto whitespace-nowrap cursor-grab no-scrollbar"
                onMouseDown={handleMouseDown}
                onMouseLeave={handleMouseLeave}
                onMouseUp={handleMouseUp}
                onMouseMove={handleMouseMove}
                ref={scrollRef}
                >
                <div className="flex gap-2 w-fit">
                    {/* <button 
                        className={`${feed === 'shorts' && 'bg-primary-100 select-none text-primary-500'} px-4 py-2 rounded-3xl text-sm capitalize bg-primary-0 text-white hover:bg-primary-100 hover:text-primary-500`}
                        onClick={() => setFeed('shorts')}>
                        Shorts
                    </button>
                    <button 
                        className={`${feed === 'shorts' && 'bg-primary-100 select-none text-primary-500'} px-4 py-2 rounded-3xl text-sm capitalize bg-[#E8EBF9] text-[#7380d1] hover:bg-primary-100 hover:text-primary-500`}
                        onClick={() => setFeed('shorts')}>
                        For You
                    </button> */}
                    <button 
                        className={`${feed === 'shorts' && 'bg-primary-100 select-none text-primary-500'} p-2 text-sm capitalize rounded-lg hover:bg-primary-100 hover:text-primary-500`}
                        onClick={() => setFeed('shorts')}>
                        Shorts
                    </button>
                    <button 
                        className={`${feed === 'for you' && 'bg-primary-100 select-none text-primary-500'} p-2 w-[70px] text-sm capitalize rounded-lg hover:bg-primary-100 hover:text-primary-500`}
                        onClick={() => setFeed('for you')}>
                        For You
                    </button>
                    <button 
                        className={`${feed === 'personalized' && 'bg-primary-100 select-none text-primary-500'} p-2 text-sm capitalize rounded-lg hover:bg-primary-100 hover:text-primary-500`}
                        onClick={() => setFeed('personalized')}>
                        Personalized
                    </button>
                    <button 
                        className={`${feed === 'latest' && 'bg-primary-100 select-none text-primary-500'} p-2 text-sm capitalize rounded-lg hover:bg-primary-100 hover:text-primary-500`}
                        onClick={() => setFeed('latest')}>
                        Latest
                    </button>
                    <button 
                        className={`${feed === 'trending' && 'bg-primary-100 select-none text-primary-500'} p-2 text-sm capitalize rounded-lg hover:bg-primary-100 hover:text-primary-500`}
                        onClick={() => setFeed('trending')}>
                        Trending
                    </button>
                </div>
            </div>
            <button 
                className="p-2 flex-none flex gap-2 border-[1px] border-gray-300 justify-center items-center rounded-xl w-[100px]"
                onClick={() => setFiltersMenu(prev => !prev)}>
                Filters <LuSettings2 />
            </button>

            {/* Filters Menu */}
            {filtersMenu &&
                <>
                    <div 
                        className="absolute top-0 bottom-0 left-0 right-0"
                        onClick={() => setFiltersMenu(prev => !prev)}>                    
                    </div>
                    <div className="absolute top-[150px] gap-4 flex flex-col w-[250px] h-fit p-6 rounded-lg border-[1px] border-gray-100 bg-white shadow-lg right-[20px] z-2">
                        <div className="flex flex-col gap-4">
                            <h1 className="text-md font-primaryMedium">Sort By</h1>
                            <div className="flex flex-col gap-2 ml-4">
                                <button 
                                    className={`text-sm w-fit ${sort === 'views' ? 'font-primaryMedium' : 'font-primaryLight'}`}
                                    onClick={() => setSort('views')}>
                                    View count
                                </button>
                                <button 
                                    className={`text-sm w-fit ${sort === 'likes' ? 'font-primaryMedium' : 'font-primaryLight'}`}
                                    onClick={() => setSort('likes')}>
                                    Likes
                                </button>
                                <button 
                                    className={`text-sm w-fit ${sort === 'date' ? 'font-primaryMedium' : 'font-primaryLight'}`}
                                    onClick={() => setSort('date')}>
                                    Upload date
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            }
        </div>
        
        {/* Displaying Feed */}
        {feed === 'latest' && <AllPostSection sort={sort} />}
        {token && userData.following && userData.following.length !== 0 && <FollowedAuthorsPosts />}
    </div>
  );
};

export default HomePage;