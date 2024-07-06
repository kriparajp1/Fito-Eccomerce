const usercollection=require("../../models/usermodel")
const productDatabase=require("../../models/productModel")
const categoryDatabase=require("../../models/category")



// get
const landingpage=async (req,res)=>{

    try {
        if(!req.session.user){
        const products= await productDatabase.find()
        const categories=await categoryDatabase.find()
        res.render("user/homepage",{status:false,products,categories})
        }else{
            res.redirect("/home")
        }
    } catch (error) {
        console.log(error)
    }
}
const login=(req,res)=>{
    try {
        if(req.session.user){
            res.redirect("/home")
        }
        else{
            res.render("user/login",{error:null,status:false})
        }
    } catch (error) {
        console.log(error)
    }
}
const signup=(req,res)=>{
    try {
        if(!req.session.user){
        res.render("user/signup",{status:false})
        }else{
            res.redirect("/home")
        }
    } catch (error) {
        console.log(error)
    }
}
const home=async (req,res)=>{
    try {
        const products= await productDatabase.find()
        const user = await usercollection.findOne({email:req.session.user})
        const categories=await categoryDatabase.find()
        if(user){
            res.render("user/homepage", {user:req.session.user,status:true,products,categories})
        }else if(req.session.user){
            req.session.user = false;
            res.render("user/login" ,{status:false,error:null});
        }
        else{
        res.render("user/login",{status:false,error:null})
        } 
    } catch (error) {
        console.log(error)
    }
}


// post
const loginpost= async(req,res)=>{
    try{
        const check =await usercollection.findOne({email:req.body.email})
    if(check.status=="active"){
        if(check.password === req.body.password){
            req.session.user = req.body.email;
            res.redirect("/home")
        }
        else{
            return res.status(400).render('user/login', { error: 'User not found' ,status:false });
        }
     }else{
        return res.status(403).render('user/login', { error: 'Your account has been blocked. Please contact support.'  ,status:false});
     }
    }
    catch(error){ 
        return res.status(400).render('user/login', { error: 'User not found' ,status:false });
    }
}


// productview

const getProductView= async (req,res)=>{
    try {
        let user= req.session.user?true:false;
        const id=req.params.id
        const product= await productDatabase.findOne({_id:id});
        const products= await productDatabase.find({product_category:product.product_category})
        res.render("user/productView",{status:user,product,products})

    } catch (error) {
        console.log(error)
    }
}

const userLogout = (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).send("Server Error");
        }
        res.redirect('/login');
    });
};
module.exports={
    landingpage,login,signup,loginpost,home,getProductView,userLogout
}