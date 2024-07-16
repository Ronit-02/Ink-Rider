import { useDispatch, useSelector } from "react-redux"
import { NavLink, useNavigate, useSearchParams } from "react-router-dom"
import { useEffect, useState } from "react";
import { logout } from "../../redux/slices/authSlice";
import NavbarLink from "../NavbarLink";

const Navbar = () => {

  // Extracting parameters
  const [searchParams] = useSearchParams();

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const token = useSelector(state => state.auth.token);
  
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('All')

  useEffect(() => {
      setQuery(searchParams.get('query') || '');
      setFilter(searchParams.get('filter') || 'posts')
  }, [searchParams]);
  

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/search?query=${query}&filter=${filter}`);
  }

  const handleLogout = () => {
    dispatch(logout());

    // reloading the whole app once to enable local storage
    window.location.reload();
  };

  return (
    <nav className="flex items-center gap-4 mb-12">
      <NavLink 
        to="/" 
        className="flex-none text-xl">
          Ink Rider
      </NavLink>
      <form className="flex flex-auto w-full" onSubmit={handleSearch}>
        <input className="flex-auto px-4 py-2 border" placeholder="posts, authors, categories.." value={query} onChange={(e) => setQuery(e.target.value)} />
        <select className="flex-none px-4 py-2 border" value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="posts">Posts</option>
          <option value="category">Category</option>
          <option value="author">Authors</option>
        </select>
      </form>
      <div className="flex flex-none gap-6 text-blue-700">
        <NavbarLink linkTo="/write" title="Write" />
        {token ? (
          <>
            <NavbarLink linkTo="/profile" title="Settings" />
            <button
              className="text-gray-400" 
              onClick={handleLogout}>
                Logout
            </button>
          </>
        ) : (
          <NavbarLink linkTo="/login" title="Login" />
        )}
      </div>
    </nav>
  )
}

export default Navbar;