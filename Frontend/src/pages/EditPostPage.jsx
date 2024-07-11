import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import fetchPost from "../api/fetchPost";
import { useEffect, useState } from "react";
import updatePost from "../api/updatePost";
import useNotification from "../components/notification/useNotification";

const EditPostPage = () => {

  const { displayNotification } = useNotification();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const {id} = useParams();
  const [image, setImage] = useState('')
  const [file, setFile] = useState('')
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [tags, setTags] = useState([]);

  // Fetching Post
  const {data, isLoading: fetchIsLoading, isError: fetchIsError, error: fetchError} = useQuery({
    queryKey: ['post', id],
    queryFn: fetchPost,
    retry: 1  // limited retries, faster reload
  })

  // Incorrect Id
  useEffect(() => {
    if(fetchError?.response?.status === 500){
      navigate('/404');
    }
  }, [fetchError, navigate])

  useEffect(() => {
    if(data){
      // Just to show Image
      setFile(data.coverImage);

      // Real Data
      setTitle(data.title);
      setBody(data.body);
      setTags(data.tags.join());
    }
  }, [data]);

  
  // Updating Post
  const {mutate, isLoading: mutateIsloading} = useMutation({
    mutationFn: updatePost,
    onSuccess: (response, {postId}) => {
      displayNotification(response.message)
      queryClient.invalidateQueries(['post', postId]);
    },
    onError: (error) => {
      displayNotification(error?.response?.data?.message || error.message, 'error');
    }
  })


  const handleImage = (e) => {
    setImage(e.target.files[0]);
    setFile(URL.createObjectURL(e.target.files[0]))
  }
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Create multipart Form
    const formData = new FormData();
    formData.append('prevImageUrl', data.coverImage);
    formData.append('imageURL', image);
    formData.append('title', title);
    formData.append('body', body);

    formData.append('tags', tags);

    mutate({id, formData});
  };
  
  // Conditional Rendering
  if(fetchIsLoading) return <div>Loading...</div>
  if(fetchIsError) return <div>{fetchError?.response?.data?.message || fetchError.message}</div>
  else
  return (
    <div className="w-full max-w-lg ml-auto mr-auto">
      <h1 className="text-3xl">Update Post</h1>
      <form className="flex flex-col gap-4 mt-4" onSubmit={handleSubmit}>
        {
          file && <img className="h-[250px]" src={file} alt="cover-image" />
        }
        <input type="file" name="coverImage" onChange={handleImage} />
        <input
          className="p-2 border"
          type="text"
          placeholder="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <textarea 
          className="p-2 border"
          placeholder="body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows='4'
          required
        />
        <input
          className="p-2 border"
          type="text"
          placeholder="tags: business, money, life, ..."
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          required
        />
        <button
          className="rounded-lg w-[120px] p-2 text-white bg-blue-500 border"
          type="submit"
          disabled={mutateIsloading}
        >
          Update Post
        </button>
      </form>
    </div>
  )
}

export default EditPostPage;