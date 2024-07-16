import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import fetchProfile from "../../api/profile/fetchProfile"
import { useEffect, useState } from "react";
import updateProfile from "../../api/profile/updateProfile";
import useNotification from "../../components/notification/useNotification";

const ProfileEditPage = () => {

    const queryClient = useQueryClient();
    const { displayNotification } = useNotification();
    const [formData, setFormData] = useState({
        username: '',
    })
    // For Profile Image
    const [imageFile, setImageFile] = useState('')
    const [imageURL, setImageURL] = useState('')


    // Fetching Profile
    const { data: userData, isLoading: fetchIsLoading, isError: fetchIsError, error: fetchError } = useQuery({
        queryKey: ["profile"],
        queryFn: fetchProfile
    });

    useEffect(() => {
        console.log(userData)
        if (userData) {
            setFormData({
                username: userData.username
            });
            setImageFile(userData.picture);
        }
    }, [userData]);


    // Updating Profile
    const { mutate, isLoading: updateIsLoading } = useMutation({
        mutationFn: updateProfile,
        onSuccess: (response) => {
            displayNotification(response.message);
            queryClient.invalidateQueries(['profile']);
        },
        onError: (error) => {
            displayNotification(error?.response?.data?.message || error.message);
        }
    })

    // Input Handlers
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value
        }));
    }
    const handleImage = (e) => {
        setImageURL(e.target.files[0]);
        setImageFile(URL.createObjectURL(e.target.files[0]));
    }

    // Submit Form
    const handleUpdate = (e) => {
        e.preventDefault();
        
        const form = new FormData();
        form.append("imageURL", imageURL);
        form.append("prevImageURL", userData.picture);
        form.append('username', formData.username);

        mutate(form);
    }

    if(fetchIsLoading) return <div>Loading...</div>
    if(fetchIsError) return <div>{fetchError?.response?.data?.message || fetchError.message}</div>

    return (
    <div>
        <form className="flex flex-col gap-8">
            <div className="relative h-[70px] w-[70px] rounded-full hover:opacity-70">
                <label className="absolute w-full h-full cursor-pointer z-5" htmlFor="profileImage"></label>
                {imageFile && 
                <img 
                    className="object-cover w-full h-full rounded-full" 
                    src={imageFile} 
                    alt="profile-image"
                />}
                <input
                    type="file"
                    id="profileImage"
                    accept=".png, .jpg, .jpeg"
                    name="profileImage"
                    onChange={handleImage}
                    hidden
                />
            </div>
            <div className="flex items-center gap-4">
                <label htmlFor="email" className="text-gray-600 w-[80px]">Email: </label>
                <input
                    className="flex-auto max-w-[300px] py-1 px-2 border-2 border-gray-200"
                    type="text"
                    id="email"
                    name="email"
                    value={userData.email}
                    disabled
                />
            </div>
            <div className="flex items-center gap-4">
                <label htmlFor="username" className="text-gray-600 w-[80px]">Username: </label>
                <input
                    className="flex-auto max-w-[300px] py-1 px-2 border-2 border-gray-200"
                    type="text"
                    id="username"
                    name="username"
                    placeholder="username"
                    value={formData.username}
                    onChange={handleChange}
                />
            </div>
            <button
                onClick={handleUpdate}
                type="submit"
                className="w-[100px] bg-black text-white rounded-3xl px-4 py-2"
                disabled={updateIsLoading}>
                Update
            </button>
        </form>
    </div>
  )
}

export default ProfileEditPage;