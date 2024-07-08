import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import createPost from "../api/createPost";

const CreatePostPage = () => {

  const [image, setImage] = useState('')
  const [file, setFile] = useState('')
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [tags, setTags] = useState([]);
  const [message, setMessage] = useState('');

  const { mutate, isLoading } = useMutation({
    mutationFn: createPost,
    onSuccess: (data) => {
      console.log("Response Data - ", data);
      setImage('');
      setFile('');
      setTitle('');
      setBody('');
      setTags([]);
      setMessage(data.message);
    },
    onError: (error) => {
      console.log("Error - ", error?.response?.data?.message || error.message);
      setMessage(error?.response?.data?.message || error.message);
    },
  });

  const handleImage = (e) => {
    setImage(e.target.files[0]);
    setFile(URL.createObjectURL(e.target.files[0]))
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append('imageURL', image);
    formData.append('title', title);
    formData.append('body', body);
    formData.append('tags', tags);

    mutate(formData);
  };

  return (
    <div className="w-full max-w-lg ml-auto mr-auto">
      <h1 className="text-3xl">Create Post</h1>
      <form className="flex flex-col gap-4 mt-4" onSubmit={handleSubmit}>
        {
          file && <img className="h-[250px]" src={file} alt="cover-image" />
        }
        <input type="file" name="coverImage" onChange={handleImage} required />
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
          className="rounded-lg w-[100px] p-2 text-white bg-blue-500 border"
          type="submit"
          disabled={isLoading}
        >
          Submit
        </button>
        {message && <p className="italic text-gray-400">{message}</p>}
      </form>
    </div>
  );
};

export default CreatePostPage;
