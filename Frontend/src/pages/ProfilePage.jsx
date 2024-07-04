import { useQuery } from "@tanstack/react-query"
import fetchUser from "../api/profile"

const ProfilePage = () => {

  const {data, isLoading, isError, error} = useQuery({
    queryKey: ['user'],
    queryFn: fetchUser,
  })

  if(isLoading)
    return <div>Loading...</div>
  
  if(isError)
      return <div>{error?.response?.data?.message || error.message}</div>

  return (
    <div className="mt-12 ml-12 w-[400px]">
      Check your profile details here
      {
        console.log("resonse data - ", data)
      }
      <p>Username: {data.user.username}</p>
      <p>Email: {data.user.email}</p>
    </div>
  )
}

export default ProfilePage