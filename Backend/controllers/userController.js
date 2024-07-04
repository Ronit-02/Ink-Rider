const fetchProfile = async (req, res) => {

    try{
        res.status(200).send({user: req.user});
    }
    catch (err){
        res.status(500).send({message: 'Server Error', error: error.message});
    }
}

module.exports = {fetchProfile};