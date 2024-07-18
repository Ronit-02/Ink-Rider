import { useState } from "react";
import { useSelector } from "react-redux";
import { NavLink, useNavigate, useParams } from "react-router-dom";
import StripeLogo from "../../assets/images/Stripe.svg"
import RazorpayLogo from "../../assets/images/Razorpay.svg"
import { useMutation } from "@tanstack/react-query";
import makePayment from "../../api/payment/makePayment";
import verifyPayment from "../../api/payment/verifyPayment";
import useNotification from "../../components/notification/useNotification";

const CheckoutPage = () => {

    const {type} = useParams();
    const { displayNotification } = useNotification();
    const navigate = useNavigate();

    const username = useSelector(state => state.auth.user);
    const email = useSelector(state => state.auth.email);
    const [paymentMethod, setPaymentMethod] = useState('stripe');

    
    // Verifying Payment
    const { mutate: verifyPaymentMutate, isLoading: verifyPaymentIsLoading } = useMutation({
        mutationFn: verifyPayment,
        onSuccess: (response) => {
            displayNotification(response.message)
            navigate('/profile');
        },
        onError: (error) => {
            displayNotification(error?.response?.data?.message || error?.message)
        }
    })

    // Making Payment
    const { mutate: paymentMutate, isLoading: paymentIsLoading } = useMutation({
        mutationFn: makePayment,
        onSuccess: (response) => {
            console.log('Payment Data Success', response?.data);
            verifyPaymentMutate(response?.data);
        },
        onError: (error) => {
            console.log('Payment Data Failure', error?.response?.data?.message || error?.message);
        }
    });

    const handlePaymentMethod = (e) => {
        setPaymentMethod(e.target.value)
    }
    
    const handlePayment = () => {
        if(paymentMethod === "razorpay"){
            const amount = type === "monthly" ? 189 : 1859;
            paymentMutate({amount});
        }
        else{
            displayNotification('Stripe not available at this moment')
        }
    }

  return (
    <div className="flex flex-col items-center justify-center w-full gap-12 h-fit">

        <div className="w-full max-w-[500px] gap-8 flex flex-col items-center">

            {/* User Details */}

            <div className="flex flex-col w-full gap-4">
                <h1 className="text-2xl">User Details</h1>
                <div className="flex flex-col gap-4 p-4 border-2">
                    <div className="flex w-full gap-4">
                        <p className="w-[40px]">Name</p>
                        <p className="text-gray-400">{username}</p>
                    </div>
                    <hr />
                    <div className="flex gap-4">
                        <p className="w-[40px]">Email</p>
                        <p className="text-gray-400">{email}</p>
                    </div>
                </div>
            </div>    
            
            {/* Plan Details */}

            <div className="flex flex-col w-full gap-6">
                <h1 className="text-2xl">Plan Details</h1>
                <div className="flex flex-col w-full gap-4 p-4 border-2 max-w-[500px]">

                    {/* Plan */}

                    <div className="flex items-center justify-between">
                        <div className="flex flex-col gap-2">
                            <h1 className="text-2xl font-semibold">Premium Plan</h1>
                            <h1>Billed {type}</h1>
                        </div>
                        <NavLink to="/plans" className="text-xs underline">Change Plan</NavLink>
                    </div>
                    
                    <hr />

                    {/* Pricing */}

                    <div className="flex flex-col gap-2">
                        <div className="flex justify-between w-full">
                            <h1 className="text-base">Price</h1>
                            {type === "monthly" ?
                                <p>₹199</p> :
                                <p>₹1,999</p>
                            }
                        </div>
                        <div className="flex items-center justify-between w-full">
                            <h1 className="text-base">Discount</h1>
                            {type === "monthly" ?
                                <p>5%</p> :
                                <p>7%</p>
                            }
                        </div>
                        <div className="flex items-center justify-between w-full text-xl font-medium">
                            <h1 className="text-base">Total</h1>
                            {type === "monthly" ?
                                <p>₹189</p> :
                                <p>₹1,859</p>
                            }
                        </div>
                    </div>

                    <hr />

                    {/* Payment */}

                    <div className="flex flex-col w-full gap-4">
                        <h1>Choose a Payment Method</h1>
                        <div className="flex gap-4 h-[50px] items-center">
                            <input 
                                type="radio" 
                                value="stripe" 
                                id="stripe" 
                                checked={paymentMethod === 'stripe'}
                                onChange={handlePaymentMethod}
                            />
                            <label
                                htmlFor="stripe">
                                <img className="cursor-pointer w-[100px]" src={StripeLogo} />
                            </label>
                        </div>
                        <hr />
                        <div className="flex gap-4 h-[50px] items-center">
                            <input 
                                type="radio" 
                                value="razorpay"
                                id="razorpay"
                                checked={paymentMethod === 'razorpay'}
                                onChange={handlePaymentMethod}
                            />
                            <label
                                htmlFor="razorpay">
                                <img className="cursor-pointer pl-3 w-[150px]" src={RazorpayLogo} />
                            </label>
                        </div>
                    </div>

                </div>
            </div>
        </div>

        <button 
            onClick={handlePayment} 
            disabled={paymentIsLoading || verifyPaymentIsLoading}
            className="px-8 py-2 text-white bg-blue-500 rounded-3xl">
            Confirm Order
        </button>

    </div>
  )
}

export default CheckoutPage;