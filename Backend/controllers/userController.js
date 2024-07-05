const fetchProfile = async (req, res) => {

    try{
        res.status(200).send({user: req.user});
    }
    catch (err){
        res.status(500).send({message: 'Cant fetch user details'});
    }
}

module.exports = {fetchProfile};