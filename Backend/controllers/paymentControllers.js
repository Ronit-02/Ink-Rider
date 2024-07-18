const Razorpay = require('razorpay');
const crypto = require('crypto');
const Payment = require('../schemas/paymentSchema');
const User = require('../schemas/userSchema')

const getPaymentOrder = (req, res) => {
    try{
        const { amount } = req.body;

        // creating razor pay instance
        const razorpayInstance = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_SECRET_KEY,
        });

        const options = {
            amount: Number(amount) * 100,
            currency: "INR",
            receipt: crypto.randomBytes(10).toString("hex")
        }

        // making an order
        razorpayInstance.orders.create(options, (error, order) => {
            if(error){
                return res.status(500).send({message: "Something went wrong"});
            }

            res.status(200).json({data: order});
        })
    }
    catch(err) {
        res.status(500).send({message: 'Cant process payment at this moment'})
    }
}

const verifyPayment = async (req, res) => {
    try{
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        // create expected sign
        const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_SECRET_KEY);
        hmac.update(razorpay_order_id + "|" + razorpay_payment_id)
        const expectedSign = hmac.digest('hex');

        // verifying payment
        const isAuthentic = expectedSign === razorpay_signature;

        if(isAuthentic){
            const payment = new Payment({
                razorpay_order_id,
                razorpay_payment_id,
                razorpay_signature,
                user_id: req.user._id
            });

            // save payment details
            await payment.save();

            // update user role
            const user = req.user;
            user.role = 'premium';
            await user.save();

            return res.status(200).send({message: "Payment done successfully"})
        }
        else
            return res.status(500).send({message: 'Transaction failed'})
    }
    catch(err){
        console.log(err)
        res.status(500).send({message: 'Cant verify payment at this moment'})
    }
}

module.exports = { getPaymentOrder, verifyPayment };