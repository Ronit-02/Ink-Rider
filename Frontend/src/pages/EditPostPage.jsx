import { useMutation, useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import fetchPost from "../api/fetchPost";
import { useEffect, useState } from "react";
import updatePost from "../api/updatePost";

const EditPostPage = () => {

  const {id} = useParams();
  const [image, setImage] = useState('')
  const [file, setFile] = useState('')
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [tags, setTags] = useState([]);
  const [message, setMessage] = useState('');

  // Fetching Old Data
  const {data, isLoading: fetchIsLoading, isError: fetchIsError, error: fetchError} = useQuery({
    queryKey: ['post', id],
    queryFn: fetchPost,
  })

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

  // Updating New Data
  const {mutate, isLoading: mutateIsloading} = useMutation({
    mutationFn: updatePost,
    onSuccess: (response) => {
      console.log('Response - ', response);
      setMessage(response.message);
    },
    onError: (error) => {
      console.log('Error - ', error?.response?.data?.message || error.message);
      setMessage(error?.response?.data?.message || error.message);
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
  
  if(fetchIsLoading)
    return <div>Loading...</div>

  if(fetchIsError)
      return <div>{fetchError?.response?.data?.message || fetchError.message}</div>

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
        {message && <p className="italic text-gray-400">{message}</p>}
      </form>
    </div>
  )
}

export default EditPostPage;