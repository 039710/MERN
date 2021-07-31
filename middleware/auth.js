const jwt = require('jsonwebtoken')
const config = require('config')

module.exports = function(req,res,next){
  let access_token = req.header('x-auth-token')
  if(!access_token){
    return res.status(401).json({message : "No token, authorization denied"})
  }

  try {
    const decoded = jwt.verify(access_token,config.get("jwtSecret"))
    req.user = decoded.user
    next()
  } catch (err) {
    console.error(err.message)
    res.status(401).json({message : "Token is not valid"})
  }

}