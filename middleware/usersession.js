// Middleware to check user session and status
const userDb=require("../models/usermodel")
async function checkSessionAndStatus (req,res,next){
  try{
    if(req.session.user){
      const userDetails = await userDb.findOne({email:req.session.user})

      if(userDetails && userDetails.status == "active"){
        next();
      }else{
        req.session.user = ""
        res.redirect('/login')
      }
    }
  }catch(error){
    console.log(`error while in middleware ${error}`)
  }
}


module.exports=checkSessionAndStatus
 