
const User = require('../models/user');
exports.fetchUserById = async (req, res) =>{

    const {id} = req.user;
  
    try {
  
      const user = await User.findById(id).exec();
      res.status(200).json({ email:user.email, name:user.name });
      
    } catch (error) {
      res.status(400).json(error);
      
    }
  
  
  }