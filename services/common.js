const passport = require('passport');

exports.isAuth = (req, res, done) =>{   
      return passport.authenticate('jwt');
  }

  exports.SanitizedUser = (user) =>{
  
    return {id:user.id, email:user.role}
  }

  exports.cookieExtractor = function(req){

    let token = null;
    if(req &&  req.cookies){
      token = req.cookies['jwt'];
  
    }
  
    return token;
  }

  