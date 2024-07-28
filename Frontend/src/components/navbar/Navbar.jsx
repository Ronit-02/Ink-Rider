import { useDispatch, useSelector } from "react-redux"
import { NavLink, useLocation, useNavigate } from "react-router-dom"
import { useEffect, useRef, useState } from "react";
import { logout } from "../../redux/slices/authSlice";
import { useQuery } from "@tanstack/react-query";
import fetchUser from "../../api/user/fetchUser";
import searchPost from "../../api/search/searchPost";
import searchCategory from "../../api/search/searchCategory";
import searchUser from "../../api/search/searchUser";

// Images
import ProfilePic from "../../assets/images/Profile-Pic.svg"

// Icons
import { BiMoon, BiBell } from "react-icons/bi"
import { IoLogOutOutline } from "react-icons/io5";
import { IoSettingsOutline } from "react-icons/io5";
import { IoIosSearch } from "react-icons/io";
import PostSkeleton from "../skeletons/PostSkeleton";


const Navbar = () => {

    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();
    const token = useSelector(state => state.auth.token);
    const email = useSelector(state => state.auth.email);
    
    const searchRef = useRef(null);
    const [query, setQuery] = useState('')
    const [filter, setFilter] = useState('posts')
    const [profileMenu, setProfileMenu] = useState(false);
    const [notifMenu, setNotifMenu] = useState(false);
    const [searchMenu, setSearchMenu] = useState(false);
    const [isSearchPage, setIsSearchPage] = useState(false);

    // Fetching User
    const { data: userData, isLoading: userIsLoading } = useQuery({
        queryKey: ['user', email],
        queryFn: fetchUser
    })

    // Fetching Posts
    const { data: searchData, isLoading: postIsLoading, isError, error } = useQuery({
        queryKey: ['posts', {query, filter}],
        queryFn: 
            filter === "posts"
            ? searchPost
            : filter === "tags"
            ? searchCategory
            : searchUser,
        retry: 1,   // faster load
        enabled: query !== ''
    })

    // focus on searchbox when searchmenu is triggered
    useEffect(() => {
        if (searchMenu && searchRef.current) {
            searchRef.current.focus();
        }
    }, [searchMenu]);


    // identify if its searchpage, if yes disable searchbar
    useEffect(() => {
        if(location.pathname === '/search')
            setIsSearchPage(true);
        else
            setIsSearchPage(false);
    }, [location.pathname])


    const handleLogout = () => {
        dispatch(logout());
        // reloading the whole app once to enable local storage
        window.location.reload();
    };


    const handleSearch = (e) => {
        e.preventDefault();
        setSearchMenu(false);
        navigate(`/search?query=${query}&filter=${filter}`);
    }   


    // Key Downs
    const handleSearchKeydown = (e) => {
        if(e.key === 'Escape')
            setSearchMenu(false);
    }


    // Conditional Rendering
    const renderSearchMenuContent = () => {

        if(query === ''){
            return <div>Enter query to Search</div>
        }

        if(postIsLoading){
            return (
                <PostSkeleton count={3} />
            )
        }

        if(isError){
            return <div>{error?.response?.data?.message || error.message}</div>;
        }

        if(searchData && searchData.length > 0){
            return filter === 'authors' 
            ? (
                searchData.map(author => {
                    return (
                        <NavLink 
                            to={`/user/${author._id}`} 
                            key={author._id}
                            onClick={() => setSearchMenu(false)}  
                            className="flex gap-4"
                        >
                            <img src={author.picture} alt="author-image" className="rounded-full w-[40px] h-[40px] object-cover" /> 
                            <div className="flex flex-col gap-2">
                                <h1 className="lowercase font-primaryMedium text-md">{author.username}</h1>
                                <h3 className="text-xs text-gray-400">{author.followers} followers</h3>
                            </div>
                        </NavLink>
                    )
                })
            ) 
            : (
                searchData.map((post) => {
                    return (
                        <NavLink 
                            to={`/post/${post._id}`} 
                            key={post._id} 
                            onClick={() => setSearchMenu(false)} 
                            className="flex gap-4"
                        >
                            <div className="w-[120px] h-[70px]">
                                <img src={post.coverImage} alt="post-image" className="object-contain w-full h-full" /> 
                            </div>
                            <div className="flex flex-col gap-2">
                                <h3 className="text-xs text-gray-400">@{post.author.username}</h3>
                                <h1 className="text-md font-primaryMedium">{post.title}</h1>
                            </div>
                        </NavLink>
                    )
                })
            )
        }

        return <div>No results found</div>
    }

    return (
    <nav className="flex items-center justify-between py-6 px-6 border-b-[1px] border-gray-100">
        <div className="flex items-center gap-4">

            <NavLink to="/" className="flex-none text-xl font-primarySemiBold">
                Ink Rider
            </NavLink>
            
            {/* Searchbar */}
            {!isSearchPage&& 
            <form 
                className="hidden sm:flex border-[1px] border-gray-300 rounded-2xl gap-2 items-center py-2 px-4 w-[300px]">
                <IoIosSearch className="text-xl text-gray-500" />
                <input 
                    className="flex-auto focus:outline-none placeholder:text-gray-400 placeholder:font-primaryLight" 
                    placeholder="search"
                    onClick={() => setSearchMenu(true)}
                />
            </form>
            }

            {/* Search Menu Starts Here */}
            {searchMenu &&
            <>
                <div 
                    className="absolute bottom-0 left-0 right-0 w-full h-screen" 
                    onClick={() => setSearchMenu(prev => !prev)}>
                </div>
                <form 
                    className="absolute left-[125px] bg-white flex border-[1px] border-gray-300 rounded-2xl gap-2 items-center py-2 px-4 w-[400px] rounded-b-none"
                    onSubmit={handleSearch}>
                    <IoIosSearch className="text-xl text-gray-500" />
                    <input 
                        className="flex-auto focus:outline-none placeholder:text-gray-400 placeholder:font-primaryLight" 
                        ref={searchRef}
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={handleSearchKeydown}
                    />
                </form>
                <div className="absolute top-[65px] left-[125px] flex flex-col gap-4 p-4 rounded-lg border-[1px] rounded-t-none border-gray-300 bg-white  z-2 w-[400px] h-fit">
                    <div className="flex justify-around">
                        <button 
                            className={`${filter === 'posts' && 'bg-primary-100 text-primary-500'} p-2 text-sm capitalize rounded-lg hover:bg-primary-100 hover:text-primary-500`}
                            onClick={() => setFilter('posts')}>
                            Posts
                        </button>
                        <button 
                            className={`${filter === 'tags' && 'bg-primary-100 text-primary-500'} p-2 text-sm capitalize rounded-lg hover:bg-primary-100 hover:text-primary-500`}
                            onClick={() => setFilter('tags')}>
                            Tags
                        </button>
                        <button 
                            className={`${filter === 'authors' && 'bg-primary-100 text-primary-500'} p-2 text-sm capitalize rounded-lg hover:bg-primary-100 hover:text-primary-500`}
                            onClick={() => setFilter('authors')}>
                            Authors
                        </button>
                    </div>
                    <hr className="text-gray-100" />
                    <div className="flex flex-col text-gray-600">
                        {renderSearchMenuContent()}
                    </div>
                </div>
            </>
            }

            {/* Search Menu Ends Here */}

        </div>
        <div className="flex flex-none gap-6 text-blue-700">
            <button>
                <BiMoon className="text-2xl text-gray-600" />
            </button>
            {token ? (

            // Signed In
            <>
                <button
                    className="text-2xl text-gray-600"
                    onClick={() => setNotifMenu(prev => !prev)}>
                    <BiBell />
                </button>
                <button
                    className="text-gray-600" 
                    onClick={() => setProfileMenu(prev => !prev)}>
                    {userIsLoading 
                    ? <div className="w-8 h-8 bg-gray-100 rounded-full animate-pulse"></div>  
                    : <img className="object-cover w-8 h-8 rounded-full" src={userData?.picture} alt="profile-picture" />
                    }
                </button>

                {/* Notif Menu */}
                {notifMenu 
                ? <>
                    <div 
                        className="absolute top-0 left-0 right-0 w-full h-full" 
                        onClick={() => setNotifMenu(prev => !prev)}>
                    </div> 
                    <div 
                        className="absolute top-[50px] gap-2 flex flex-col w-[250px] h-[300px] p-6 rounded-lg border-[1px] border-gray-100 bg-white shadow-lg right-[20px] z-2">
                        <h1 className="text-md font-primaryMedium">Notifications</h1>
                        <hr className="text-gray-100" />
                        <div className="flex flex-col items-center justify-center h-full">
                            <h3 className="text-sm text-gray-600">No notifications yet</h3>
                        </div>
                    </div>
                </>
                : null
                }

                {/* Profile Menu */}
                {profileMenu 
                ? <>
                    <div 
                        className="absolute top-0 left-0 right-0 w-full h-full" 
                        onClick={() => setProfileMenu(prev => !prev)}>
                    </div> 
                    <div className="absolute top-[50px] right-[20px] flex flex-col gap-4 p-4 rounded-lg border-[1px] border-gray-100 bg-white shadow-lg z-2 w-fit h-fit">
                        <div className="flex items-center gap-4">
                            <img className="object-cover w-8 h-8 rounded-full" src={userData?.picture || ProfilePic} alt="profile-picture" />
                            <div className="flex flex-col gap-2">
                                <h1 className="capitalize text-md">{userData.username}</h1>
                                <h2 className="text-xs text-gray-600">{userData.email}</h2>
                            </div>
                        </div>
                        <hr className="text-gray-100" />
                        <div className="flex flex-col text-gray-600">
                            <NavLink 
                                className="flex items-center gap-2 p-2 text-sm rounded-sm hover:bg-primary-100" 
                                to="/profile"
                                onClick={() => setProfileMenu(prev => !prev)}> 
                                <IoSettingsOutline /> Settings
                            </NavLink>
                        </div>
                        <hr className="text-gray-100" />
                        <div className="flex flex-col text-gray-600">
                            <button 
                                className="flex items-center gap-2 p-2 text-sm rounded-sm hover:bg-[#fff3f0]" 
                                onClick={handleLogout}> 
                                <IoLogOutOutline /> Logout
                            </button>
                        </div>
                    </div>
                </>
                : null
                }
            </>
            ) : (

            // Not Signed In
            <>
                <button 
                    className="px-4 py-2 text-sm font-medium text-white rounded-3xl bg-primary-0"
                    onClick={() => navigate('/login')}>
                    Sign In
                </button>
            </>
            )}
        </div>
    </nav>
  )
}

export default Navbar;