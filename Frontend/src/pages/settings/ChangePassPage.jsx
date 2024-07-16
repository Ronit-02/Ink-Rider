import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import useNotification from "../../components/notification/useNotification";
import updatePassword from "../../api/profile/updatePassword";
import fetchProfile from "../../api/profile/fetchProfile";

const ChangePass = () => {

    const queryClient = useQueryClient();
    const { displayNotification } = useNotification();
    const [formData, setFormData] = useState({
        oldPassword: '',
        newPassword: ''
    })

    // Fetching Profile
    const { data: userData, isLoading: fetchIsLoading, isError: fetchIsError, error: fetchError } = useQuery({
        queryKey: ["profile"],
        queryFn: fetchProfile
    });

    useEffect(() => {
        console.log(userData);
    },[userData])

    // Updating Profile
    const { mutate, isLoading: updateIsLoading } = useMutation({
        mutationFn: updatePassword,
        onSuccess: (response) => {
            displayNotification(response.message);
            queryClient.invalidateQueries(['profile']);
        },
        onError: (error) => {
            displayNotification(error?.response?.data?.message || error.message);
        }
    })

    // Input Handler
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value
        }))
    }

    // Submit Form
    const handleUpdate = (e) => {
        e.preventDefault();
        console.log(formData);
        mutate(formData);
    }

    // Conditional Rendering
    if(fetchIsLoading) return <div>Loading...</div>
    if(fetchIsError) return <div>{fetchError?.response?.data?.message || fetchError.message}</div>
    if(userData?.googleId !== null)
        return <div>You are logged in with Google.</div>

  return (
    <div>
        <form className="flex flex-col gap-8">
            <div className="flex items-center gap-4">
                <label htmlFor="oldPassword" className="text-gray-600 w-[120px]">Old Password: </label>
                <input
                    className="flex-auto max-w-[300px] py-1 px-2 border-2 border-gray-200"
                    type="password"
                    name="oldPassword"
                    placeholder="old password"
                    value={formData.oldPassword}
                    onChange={handleChange}
                    required
                />
            </div>
            <div className="flex items-center gap-4">
                <label htmlFor="newPassword" className="text-gray-600 w-[120px]">New Password: </label>
                <input
                    className="flex-auto max-w-[300px] py-1 px-2 border-2 border-gray-200"
                    type="password"
                    name="newPassword"
                    placeholder="new password"
                    value={formData.newPassword}
                    onChange={handleChange}
                    required
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

export default ChangePass;