import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import fetchPost from "../api/fetchPost";
import updatePost from "../api/updatePost";
import useNotification from "../components/notification/useNotification";
import tagsData from "../utils/tagsData";

const EditPostPage = () => {

    const {id} = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { displayNotification } = useNotification();
    
    // Form States
    const [imageFile, setImageFile] = useState('')
    const [imageURL, setImageURL] = useState('')
    const [title, setTitle] = useState("");

    // tags
    const [tags, setTags] = useState([])
    const [tagText, setTagText] = useState('')

    // body
    const [blocks, setBlocks] = useState([{
        id: Date.now(),
        text: '',
        type: 'paragraph'
    }])
    const [prevKey, setPrevKey] = useState("");
    const [optionsIndex, setOptionsIndex] = useState(null)
    const inputRefs = useRef([]);


    // Fetching Post
    const {data, isLoading: fetchIsLoading, isError: fetchIsError, error: fetchError} = useQuery({
        queryKey: ['post', id],
        queryFn: fetchPost,
        retry: 1  // limited retries, faster reload
    })

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


    // Submitting Form
    const handleSubmit = (e) => {
        e.preventDefault();
    
        // Create multipart Form
        const formData = new FormData();
        formData.append('prevImageUrl', data.coverImage);
        formData.append('imageURL', imageURL);
        formData.append('title', title);
        formData.append('tags', tags);
        formData.append('body', JSON.stringify(blocks));

        mutate({id, formData});
    };


    // Setting Initial Data
    useEffect(() => {
        if(data){
            // Just to show Image
            setImageFile(data.coverImage);

            // Real Data
            setTitle(data.title);
            setTags(data.tags);
            // console.log(data.tags[0])
            // console.log(typeof(data.tags));
            setBlocks(JSON.parse(data.body));
        }
    }, [data]);


    // Incorrect Id
    useEffect(() => {
        if(fetchError?.response?.status === 500){
            navigate('/404');
        }
    }, [fetchError, navigate])


    // Automatically Resizing to ScrollHeight on Change
    useEffect(() => {
        const tx = document.getElementsByTagName('textarea');
        for(let i=0; i<tx.length; i++){
            tx[i].setAttribute("style", "height:" + "0px");
            tx[i].setAttribute("style", "height:" + (tx[i].scrollHeight) + "px");
        }
    },[title, blocks])


    // Input Handlers
    const handleImage = (e) => {
        setImageURL(e.target.files[0]);
        setImageFile(URL.createObjectURL(e.target.files[0]));
    }
    const handleTitleChange = (e) => {
        setTitle(e.target.value);
    }
    const handleTagsChange = (e) => {
        setTagText(e.target.value);
    }
    const handleBlockChange = (index, e) => {
        const { name, value } = e.target;
        const newBlocks = blocks.map((block, i) => (
            i === index ? {...block, [name]: value} : block
        ));
        setBlocks(newBlocks);
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


    // Tag Menu
    const addTag = (tag) => {
        const updatedTags = [...tags, tag];
        setTags(updatedTags);
        setTagText('');
    }
    const removeTag = (index) => {
        const updatedTags = [...tags];
        updatedTags.splice(index, 1);
        setTags(updatedTags);
    }


    // Blocks Options Menu
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

  
    // Conditional Rendering
    if(fetchIsLoading) return <div>Loading...</div>
    if(fetchIsError) return <div>{fetchError?.response?.data?.message || fetchError.message}</div>

  return (
    <div className="flex flex-col items-center w-full">
        <form className="flex flex-col gap-8 w-full max-w-[700px]">
            <div className="flex justify-between items-center w-full max-w-[700px]">
                <h1 className="text-3xl">Edit Post</h1>
                <button 
                    type="submit" 
                    onClick={handleSubmit} 
                    disabled={mutateIsloading}
                    className="px-4 py-2 text-white bg-black w-fit rounded-3xl disabled:cursor-wait">
                    Update
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
                    className = "w-full h-0 p-2 overflow-hidden text-3xl font-semibold leading-tight border-l-2 outline-none resize-none placeholder:opacity-60"
                />
                <div className="relative flex flex-col w-full gap-2 p-2 border-2">
                    <div className="h-[50px] w-full">
                        <input
                            type="text"
                            placeholder="Add tags"
                            value={tagText}
                            onChange={handleTagsChange}
                            onKeyDown={handleTagsKeydown}
                            className = "min-w-[60px] h-full w-full p-2 overflow-hidden outline-none resize-none placeholder:opacity-80"
                        />
                    </div>
                    <div className="flex flex-wrap w-full gap-2 h-fit">
                    {
                        tags.map((tag, index) => (
                            <div key={index} className="flex gap-4 px-4 py-1 bg-gray-100 rounded-lg">
                                <p className="font-medium">{tag}</p>
                                <button onClick={() => removeTag(index)}>✕</button>
                            </div>
                        ))
                    }
                    </div>
                    {
                        tagText && tagsData.filter((tag) => tag.startsWith(tagText.toLowerCase()))[0] &&
                        <div className="absolute z-10 flex flex-col gap-2 p-2 mb-4 bg-white border-2 rounded-lg bottom-full h-fit w-fit">
                            {tagsData
                                .filter((tag) => tag.startsWith(tagText.toLowerCase()))
                                .slice(0, 3) // Limit to the first two results if that's the intention
                                .map((tag, index) => (
                                    <div
                                        key={index}
                                        className="w-full h-full p-2 capitalize cursor-pointer hover:bg-gray-100"
                                        onClick={() => addTag(tag)}>
                                        {tag}
                                    </div>
                            ))}
                        </div>
                    }
                </div>
            </div>
            <div className="flex flex-col w-full gap-4">
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
                                    className = "w-full h-0 px-2 overflow-hidden text-3xl font-semibold border-l-2 outline-none resize-none"
                                    name = "text"
                                    value = {block.text}
                                    placeholder="heading 1"
                                    onChange = {(e) => handleBlockChange(index, e)}
                                    onKeyDown = {(e) => handleBlockKeydown(index, e)}
                                    ref = {(el) => (inputRefs.current[index] = el)}
                                />
                                :
                                <textarea
                                    className = "w-full h-0 px-2 overflow-hidden text-base border-l-2 outline-none resize-none"
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

export default EditPostPage;