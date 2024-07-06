const OrderDatabase = require('../../models/orderModel');
const AddressDatabase = require('../../models/addressModel');
const userbasecollections=require("../../models/usermodel")
const Product=require("../../models/productModel")
const Cart=require("../../models/cartModel")

// Render checkout page
const renderCheckoutPage = async (req, res) => {
    try {
        const placeOrder=req.query.id
        const product=await Product.findById(placeOrder)
        const user=await userbasecollections.findOne({email:req.session.user})
        console.log(user)
        let current=req.session.user?true:false
        const addresses = await AddressDatabase.find({user:user._id });
        res.render('user/checkout', { addresses,status:current ,product});

    } catch (error) {
        res.status(500).json({ error: 'Failed to load checkout page', details: error.message });
    }
};

// Place an order
const placeOrder = async (req, res) => {
    try {
        
        const user= await userbasecollections.findOne({email:req.session.user});
        const userId =user._id
        const { orderedItems, address, paymentMethod, totalAmount, discountAmount, finalAmount, deliveryCharge, couponDiscount, offerDiscount } = req.body;


        const items = orderedItems.map(item => ({
            productId: item.productId,
            product_name: item.product_name,
            product_images: item.product_images,
            price: item.price,
            quantity: item.quantity,
            status: 'Pending',
            returned: false
        }));

        const newOrder = new OrderDatabase({
            user_id: userId,
            orderedItems: items,
            shippingAddress: address,
            paymentMethod,
            totalAmount:items[0].price,
            discountAmount,
            finalAmount:items[0].price,
            deliveryCharge,
            couponDiscount,
            offerDiscount
        });

        await newOrder.save();
        res.redirect("/thankyou");
    } catch (error) {
        res.status(500).json({ error: 'Failed to place order', details: error.message });
    }
};
const addAddress = async (req, res) => {
    try {
        const userId = req.session.user;
        const user=await userbasecollections.findOne({email:userId})
        
        const { firstName, lastName, country, address, city, state, pincode, phone, email, saveInfo } = req.body;

        const newAddress = new AddressDatabase({
            user: user._id,
            name: `${firstName} ${lastName}`,
            mobile: phone,
            pincode,
            address,
            district: city,
            state,
            landmark: '' // optional
        });

        await newAddress.save();
        res.redirect('/checkOut');
    } catch (error) {
        res.status(500).json({ error: 'Failed to add address', details: error.message });
    }
};
const buyNow = async (req, res) => {
    try {
        const userId = await userbasecollections.findOne({email:req.session.user});
        const { productId } = req.body;

        let cart = await Cart.findOne({ user: userId._id });
        if (!cart) {
            cart = new Cart({ user: userId, items: [] });
        }

        const product = await Product.findById(productId);
        const itemIndex = cart.items.findIndex(item => item.productId.equals(productId));

        if (itemIndex > -1) {
            cart.items[itemIndex].quantity += 1;
        } else {
            cart.items.push({ productId, product, quantity: 1 });
        }

        await cart.save();
        res.redirect(`/checkout?id=${productId}`); 
    } catch (error) {
        res.status(500).json({ error: 'Failed to proceed to checkout', details: error.message });
    }
};
// cartcheckout

const renderCartCheckoutPage = async (req, res) => {
    try {
        const user = await userbasecollections.findOne({ email: req.session.user });
        if (!user) {
            return res.status(400).json({ message: 'User not found', status: 'error' });
        }

        const cart = await Cart.findOne({ user: user._id }).populate('items.product');
        if (!cart || cart.items.length === 0) {
            return res.redirect('/cart'); // Redirect to cart page if cart is empty
        }

        const addresses = await AddressDatabase.find({ user: user._id });

        const cartItems = cart.items.map(item => ({
            productId: item.product._id,
            product: item.product,
            quantity: item.quantity
        }));

        const cartTotal = cartItems.reduce((total, item) => total + (item.product.product_price * item.quantity), 0);

        res.render('user/cartCheckOut', {
            status:true,
            cartItems,
            addresses,
            cartTotal,
            user: user.firstName // Pass the user object to the template
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error', status: 'error' });
    }
};

const placeCartOrder = async (req, res) => {
    try {
        const user = await userbasecollections.findOne({ email: req.session.user });
        if (!user) {
            return res.status(400).json({ message: 'User not found', status: 'error' });
        }

        const { orderedItems, address, paymentMethod, couponCode } = req.body;

        // Validate quantities within the allowed range
        const validOrderedItems = orderedItems.map(item => ({
            ...item,
            quantity: Math.min(item.quantity, 15) // Ensure quantity does not exceed 15
        }));

        const totalAmount = validOrderedItems.reduce((total, item) => total + (item.price * item.quantity), 0);
        const discountAmount = 300; // Assuming a fixed discount for the example
        const finalAmount = totalAmount - discountAmount;

        // Adjust product stock
        for (const item of validOrderedItems) {
            const product = await Product.findById(item.productId);
            if (product.product_stock < item.quantity) {
                return res.status(400).json({ message: `Insufficient stock for product: ${product.product_name}`, status: 'insufficient_stock' });
            }
            product.product_stock -= item.quantity;
            await product.save();
        }

        const newOrder = new OrderDatabase({
            user_id: user._id,
            orderedItems: validOrderedItems,
            shippingAddress: address,
            paymentMethod,
            totalAmount,
            discountAmount,
            finalAmount,
            status: paymentMethod === 'COD' ? 'Pending' : 'Completed'
        });

        await newOrder.save();

        await Cart.findOneAndUpdate({ user: user._id }, { items: [] }); // Clear the cart

        res.redirect('/thankyou');
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error', status: 'error' });
    }
};

const thankyou=(req,res)=>{
    try {
        const user=req.session.user
        res.render("user/thankyou",{user})
    } catch (error) {
        res.send(error)
    }
}


module.exports={
    renderCheckoutPage,placeOrder,addAddress,buyNow,renderCartCheckoutPage,
    placeCartOrder,thankyou
}