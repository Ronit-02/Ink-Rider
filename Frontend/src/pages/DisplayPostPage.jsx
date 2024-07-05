import { useQuery } from "@tanstack/react-query"
import fetchPost from "../api/fetchPost";
import { useParams } from "react-router-dom";

const DisplayPostPage = () => {

  const { id } = useParams();

  const {data, isLoading, isError, error} = useQuery({
    queryKey: ['post', id],
    queryFn: fetchPost,
  });

  if(isLoading)
    return <div>Loading...</div>
  
  if(isError)
    return <div>{error?.response?.data?.message || error.message}</div>

  return (
    <div className="flex flex-col w-full max-w-3xl gap-4 ml-auto mr-auto">
      <img className="w-full h-[300px]" src={data.coverImage} alt="cover-image" />
      <h1 className="items-center text-3xl text-center capitalize">{data.title}</h1>
      <h3 className="ml-auto">{data.author.username}</h3>
      <p>{data.body}</p>
    </div>
  )
}

export default DisplayPostPage