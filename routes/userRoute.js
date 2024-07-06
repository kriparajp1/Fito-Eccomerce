const express=require("express")
const route=express.Router()
const usercontroller=require("../controller/user/userController")
const otpcontroller=require("../controller/user/otpvalidate")
const isUser=require("../middleware/usersession")
const product_list=require("../controller/user/product_list")
const userPanel=require("../controller/user/userPanel")
const checkOut=require("../controller/user/checkout")
const cart=require("../controller/user/cart")
const orderController=require("../controller/user/orderStatus")
const wishlist=require("../controller/user/whishlist")


const userSchema=require('../models/usermodel')

// login/signup/home
route.get("/",usercontroller.landingpage)
route.get("/login",usercontroller.login)
route.get("/signup",usercontroller.signup)
route.get("/home", isUser ,usercontroller.home)
route.post("/signuppost",otpcontroller.signuppost)
route.post("/loginpost",usercontroller.loginpost)
route.post("/validate-otp",otpcontroller.sotp)
route.get("/logout",usercontroller.userLogout)
route.post("/resend-otp",otpcontroller.resendOtp)



route.post('/check-user',async (req,res)=>{
    const {value}=req.body;

    const checkuser=await userSchema.findOne({email:value})


    if(checkuser){
        return res.status(200).json({success:"User exist proceed with login login"})
    }else{
        return res.status(404).json({error:"User not found please register first"})
    }
})

// product view

route.get("/productView/:id",usercontroller.getProductView)

// productList

route.get("/productList",product_list.productList)

// userPanel
 
route.get("/userPanel",isUser,userPanel.userPanel)
route.post('/update-profile', isUser,userPanel.updateUserProfile);
route.post('/add-address', isUser,userPanel.addAddress);
route.post('/update-address/:addressId', isUser,userPanel.updateAddress);

// checkOut
route.get("/checkOut",isUser,checkOut.renderCheckoutPage)
route.post('/add-address',isUser,checkOut.addAddress);
route.post('/place-order',isUser,checkOut.placeOrder);
route.post('/buy-now',isUser,checkOut.buyNow)
route.get('/cart-checkout',isUser,checkOut.renderCartCheckoutPage)
route.post('/place-cart-order',isUser,checkOut.placeCartOrder)
route.get("/thankyou",isUser,checkOut.thankyou)
 

// cart
route.post('/add-to-cart',isUser,cart.addToCart )
route.get("/cart",isUser,cart.getCart)
route.post('/remove',isUser, cart.removeFromCart);
route.post('/update-quantity',isUser, cart.updateCartQuantity);

// orderStatus
route.get('/order-Status',isUser,orderController.orderItems)
route.post('/cancel-order',isUser,orderController.cancelOrder)
route.post('/return-order',isUser,orderController.returnOrder)


// wishlist 
route.get("/wishlist",wishlist.wishlist)
route.post('/wishlist/add',wishlist.wishlistAdd)




module.exports=route 