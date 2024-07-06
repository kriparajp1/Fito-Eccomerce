const Wishlist=require("../../models/wishlist")
const User=require("../../models/usermodel")

const wishlist=(req,res)=>{
    try {
        res.render("user/wishlist")
    } catch (error) {
        
    }
}
const wishlistAdd=async (req, res) => {
    const {productId } = req.body;
    const user= await User.findOne({email:req.session.user})

    try {
        let wishlist = await Wishlist.findOne({ userId:user._id });

        if (!wishlist) {
            wishlist = new Wishlist({ userId:user._id, products: [] });
        }
        const productExists = wishlist.products.some(p => p.product.toString() === productId);

        if (productExists) {
            return res.status(200).json({ message: 'Product already in wishlist' });
        }

        wishlist.products.push({ product: productId });
        await wishlist.save();

        res.status(200).json({ message: 'Wishlist added successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error adding to wishlist' });
    }
}
module.exports={
    wishlist,wishlistAdd
}