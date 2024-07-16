import { useEffect, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import useNotification from "../components/notification/useNotification";
import createPost from "../api/createPost";

const CreatePostPage = () => {

    const navigate = useNavigate();
    const { displayNotification } = useNotification();

    // Form States
    const [imageFile, setImageFile] = useState('')
    const [imageURL, setImageURL] = useState('')
    const [title, setTitle] = useState('')
    const [tags, setTags] = useState('')
    const [blocks, setBlocks] = useState([{
        id: Date.now(),
        text: '',
        type: 'paragraph'
    }])
    const [prevKey, setPrevKey] = useState("");
    const [optionsIndex, setOptionsIndex] = useState(null)
    const inputRefs = useRef([]);


    useEffect(() => {
        console.log('blocks - ', blocks);
    }, [blocks])


    // Creating Post
    const { mutate, isLoading } = useMutation({
        mutationFn: createPost,
        onSuccess: (response) => {
            navigate(`/post/${response.postId}`);
            displayNotification(response.message);
        },
        onError: (error) => {
            displayNotification(error?.response?.data?.message || error.message, 'error');
        },
    });


    // Submitting Form
    const handleSubmit = (e) => {
        e.preventDefault();
    
        const formData = new FormData();
        formData.append('imageURL', imageURL);
        formData.append('title', title);
        formData.append('tags', tags);
        formData.append('body', JSON.stringify(blocks));
        mutate(formData);
  };


    // Input Handlers
    const handleImage = (e) => {
        setImageURL(e.target.files[0]);
        setImageFile(URL.createObjectURL(e.target.files[0]));
    }
    const handleTitleChange = (e) => {
        setTitle(e.target.value);
        
        // making height change with scroll height
        const input = e.target;
        input.style.height = 'auto';
        input.style.height = input.scrollHeight + 'px';
    }
    const handleTagsChange = (e) => {
        setTags(e.target.value);
        
        // making height change with scroll height
        const input = e.target;
        input.style.height = 'auto';
        input.style.height = input.scrollHeight + 'px'; 
    }
    const handleBlockChange = (index, e) => {
        const { name, value } = e.target;
        const newBlocks = blocks.map((block, i) => (
            i === index ? {...block, [name]: value} : block
        ));
        setBlocks(newBlocks);

        const input = e.target;
        input.style.height = 'auto';
        input.style.height = input.scrollHeight + 'px';
    }

    // Keydown Handlers
    const handleTitleKeydown = (e) => {
        if(e.key === 'Enter')
            e.preventDefault();
    }
    const handleTagsKeydown = (e) => {
        if(e.key === 'Enter')
            e.preventDefault();
    }
    const handleBlockKeydown = (index, e) => {
        if(prevKey !== 'Shift' && e.key === 'Enter'){
            e.preventDefault();
            addBlock(index + 1);   
        }
        if(index > 0 && e.key === 'Backspace' && blocks[index].text === ''){
            removeBlock(index);
        }
        if(e.key === '/'){
            setOptionsIndex(index);
        }
        if(e.key === 'Escape')
            setOptionsIndex(null)

        setPrevKey(e.key);
    }

    // Options Menu
    const changeBlockType = (index, type) => {
        const newBlocks = blocks.map((block, i) => (
            index === i ? {...block, type: type} : block
        ))
        
        // removing '/' keyword
        const n = newBlocks[index].text.length;
        newBlocks[index].text =  newBlocks[index].text.slice(0, n-1);

        setBlocks(newBlocks);
        setOptionsIndex(null);
    }
    const addBlock = (index) => {
        const newBlock = {
            id: Date.now(),
            text: '',
            type: 'paragraph'
        }
        const newBlocks = [...blocks];
        newBlocks.splice(index, 0, newBlock);
        setBlocks(newBlocks);
        setTimeout(() => {
            inputRefs.current[index]?.focus();
        }, 0);
    }
    const removeBlock = (index) => {
        const newBlocks = [...blocks];
        newBlocks.splice(index, 1);
        setBlocks(newBlocks);
        setTimeout(() => {
            inputRefs.current[index-1]?.focus();
        }, 0);
    }


  return (
    <div className="flex flex-col items-center w-full">
        <form className="flex flex-col gap-8 w-full max-w-[700px]">
            <div className="flex justify-between items-center w-full max-w-[700px]">
                <h1 className="text-3xl">Create Post</h1>
                <button 
                    type="submit" 
                    onClick={handleSubmit} 
                    disabled={isLoading}
                    className="px-4 py-2 text-white bg-black w-fit rounded-3xl">
                    Publish
                </button>
            </div>
            <div className="relative h-[300px] border-2 w-full rounded-lg hover:opacity-70">
                <label 
                    className="absolute flex items-center justify-center w-full h-full text-3xl cursor-pointer z-5" 
                    htmlFor="coverImage">
                    {imageFile ? null : <p>Upload Cover</p>}
                </label>
                {imageFile &&
                <img 
                    className="object-cover w-full h-full" 
                    src={imageFile}
                    alt="cover-image"
                />}
                <input
                    type="file"
                    id="coverImage"
                    accept=".png, .jpg, .jpeg"
                    name="coverImage"
                    onChange={handleImage}
                    required
                    hidden
                />
            </div>
            <div className="flex flex-col w-full gap-4">
                <textarea
                    type="text"
                    placeholder="Post Title"
                    value={title}
                    onChange={handleTitleChange}
                    onKeyDown={handleTitleKeydown}
                    className = "w-full p-2 overflow-hidden text-3xl font-semibold leading-tight border-l-2 outline-none resize-none placeholder:opacity-60"
                />
                <textarea
                    type="text"
                    placeholder="Tags: business, money, life, ..."
                    value={tags}
                    onChange={handleTagsChange}
                    onKeyDown={handleTagsKeydown}
                    className = "w-full p-2 overflow-hidden text-base leading-snug border-2 outline-none resize-none placeholder:opacity-60"
                />
            </div>
            <div className="flex flex-col w-full">
                {blocks &&
                blocks.map((block, index) => {
                    return (
                        <div key = {block.id} className="relative w-full">
                            {optionsIndex === index && 
                            <div className="absolute z-10 bg-white top-full h-[100px] border-2 flex-col flex w-[200px]">
                                <button className="w-full h-full hover:bg-gray-100" onClick={() => changeBlockType(index, 'heading')}>Heading</button>
                                <button className="w-full h-full hover:bg-gray-100" onClick={() => changeBlockType(index, 'paragraph')}>Paragraph</button>
                            </div>}
                            {
                                block.type === 'heading' 
                                ?
                                <textarea 
                                    className = "w-full h-12 p-2 overflow-hidden text-3xl font-semibold border-l-2 outline-none resize-none"
                                    name = "text"
                                    value = {block.text}
                                    placeholder="heading 1"
                                    onChange = {(e) => handleBlockChange(index, e)}
                                    onKeyDown = {(e) => handleBlockKeydown(index, e)}
                                    ref = {(el) => (inputRefs.current[index] = el)}
                                />
                                :
                                <textarea
                                    className = "w-full h-12 p-2 overflow-hidden text-base border-l-2 outline-none resize-none"
                                    name = "text"
                                    value = {block.text}
                                    placeholder="paragraph"
                                    onChange = {(e) => handleBlockChange(index, e)}
                                    onKeyDown = {(e) => handleBlockKeydown(index, e)}
                                    ref = {(el) => (inputRefs.current[index] = el)}
                                />
                            }
                        </div>
                    )
                })}
            </div>
        </form>
    </div>
  )
}

export default CreatePostPage;