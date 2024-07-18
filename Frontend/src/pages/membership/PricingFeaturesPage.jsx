import { useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import useModal from "../../components/modal/useModal";

const PricingFeaturesPage = () => {

    const navigate = useNavigate();
    const { openModal } = useModal();
    const token = useSelector(state => state.auth.token);
    const role = useSelector(state => state.auth.role);
    const [billed, setBilled] = useState('monthly');

    const handleSignup = () => {
        navigate('/signup')
    };

    const handleSubscribe = () => {
        if(!token)
            openModal({
                title: 'Login Now',
                message: 'You need to Login first',
                onConfirm: () => {
                    return navigate('/login');
                },
                confirmText: "Login",
                onCancel: () => {
                    return null;
                },
                cancelText: "Not Now"
    })
        else
            navigate(`/checkout/${billed}`)
    }

    const handleUnsubscribe = () => {
        console.log('User wants to unsub')
    }

  return (
    <div className="flex flex-col items-center justify-center w-full gap-12 h-fit">
        <div className="flex flex-col gap-4 text-center">
            <h1 className="text-3xl">Explore our plans according to your needs</h1>
            <h3 className="text-gray-600">You can bill it anually or monthly</h3>
        </div>
        <div className="flex gap-6 px-2 py-1 border-2 rounded-full">
            <button
                onClick={() => setBilled('monthly')}
                className="w-[120px] px-4 py-2 border-2 rounded-3xl">
                Monthly
            </button>
            <button
                onClick={() => setBilled('yearly')} 
                className="w-[120px] px-4 py-2 border-2 rounded-3xl">
                Yearly
            </button>
        </div>
        <section className="flex flex-wrap justify-center gap-8">
            <div className="w-[300px] h-[500px] flex flex-col gap-8 border-2 p-6">
                <div className="flex flex-col gap-2">
                    <h3 className="text-xl">Basic</h3>
                    <h1 className="text-4xl">₹0</h1>
                </div>
                {
                    role === null  
                    ? <button
                        onClick={handleSignup} 
                        className="w-full px-4 py-2 border-2">
                        Sign up for free
                    </button>
                    
                    : role === 'regular' 
                    ? <button
                        disabled
                        className="w-full px-4 py-2 border-2 cursor-not-allowed">
                        Unlocked
                    </button>
                    
                    : <button
                        onClick={handleUnsubscribe} 
                        className="w-full px-4 py-2 border-2">
                        Unsubscribe to regular
                    </button>
                }
                <ul className="flex flex-col gap-4">
                    <li>✓ Read Articles</li>
                    <li>✓ Write Articles</li>
                    <li>✓ Participate in Competitions</li>
                    <li>✓ Ask Questions</li>
                </ul>
            </div>
            <div className="w-[300px] h-[500px] flex flex-col gap-8 border-2 p-6">
                <div className="flex flex-col gap-2">
                    <h3 className="text-xl">Premium</h3>
                    {
                        billed === 'monthly' 
                        ? <h1 className="text-4xl">₹199 / month</h1> 
                        : <h1 className="text-4xl">₹1,999 / year</h1>
                    }
                </div>
                {
                    role === null  
                    ? <button
                        onClick={handleSubscribe} 
                        className="w-full px-4 py-2 border-2">
                        Subscribe Now
                    </button>
                    
                    : role === 'regular' 
                    ? <button
                        onClick={handleSubscribe}
                        className="w-full px-4 py-2 border-2">
                        Subscribe Now
                    </button>
                    
                    : <button 
                        disabled
                        className="w-full px-4 py-2 border-2 cursor-not-allowed">
                        Unlocked
                    </button>
                }
                <ul className="flex flex-col gap-4">
                    <li>✓ Early Access Articles</li>
                    <li>✓ Authors Exclusive Content</li>
                    <li>✓ Ask Your Authors</li>
                    <li>✓ Analytics</li>
                    <li>✓ Listen your Favorite Articles</li>
                </ul>
            </div>
        </section>
    </div>
  )
}

export default PricingFeaturesPage;