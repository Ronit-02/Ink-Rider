import { NavLink } from "react-router-dom"

const LoginFirst = () => {
  return (
    <div className="flex flex-col items-center w-full max-w-lg gap-4 ml-auto mr-auto">
        <h1 className="text-2xl">Session Expired, You have been logged out</h1>
        <NavLink to={'/login'} className="w-[120px] bg-black rounded-3xl py-2 text-white text-center">
            Login Now
        </NavLink>
    </div>
  )
}

export default LoginFirst