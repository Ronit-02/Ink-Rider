import { NavLink } from "react-router-dom"

const NotFoundPage = () => {
  return (
    <div className="flex flex-col items-center justify-center w-full h-full gap-4">
      <h1>404 - Page Not Found</h1>
      <p>The page you are looking for does not exist.</p>
      <NavLink className="underline" to="/"> Go to Home </NavLink>
    </div>
  )
}

export default NotFoundPage