const Cart = require('../../models/cartModel');
const Product = require('../../models/productModel');
const userBase = require('../../models/usermodel');

const addToCart = async (req, res) => {
    try {
        const user = await userBase.findOne({ email: req.session.user });
        const productId = req.body.productId;

        if (!user) {
            return res.status(400).json({ message: 'User not found', status: 'error' });
        }

        let cart = await Cart.findOne({ user: user._id });
        if (!cart) {
            cart = new Cart({ user: user._id, items: [] });
        }

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found', status: 'error' });
        }

        const itemIndex = cart.items.findIndex(item => item.productId.equals(productId));
        if (itemIndex > -1) {
            return res.json({ message: 'Product already exists in cart', status: 'exists' });
        } else {
            cart.items.push({ productId, product, quantity: 1 });
            await cart.save();
            return res.json({ message: 'Product added to cart successfully', status: 'added' });
        }
    } catch (error) {
        console.error('Error adding product to cart:', error);
        return res.status(500).json({ error: 'Failed to add product to cart', details: error.message });
    }
};

const getCart = async (req, res) => {
    try {
        if(req.session.user){
        const user = await userBase.findOne({ email: req.session.user });
        if (!user) {
            return res.status(400).json({ message: 'User not found', status: 'error' });
        }

        const cart = await Cart.findOne({ user: user._id }).populate('items.product');
        if (!cart) {
            return res.render('user/cart', { items: [], total: 0 });
        }

        res.render('user/cart', { items: cart.items, status: !!req.session.user });
    }else{
        res.redirect("/login")
    }
    } catch (error) {
        console.error('Error retrieving cart:', error);
        res.status(500).json({ error: 'Failed to retrieve cart', details: error.message });
    }
};

const removeFromCart = async (req, res) => {
    try {
        const user = await userBase.findOne({ email: req.session.user });
        if (!user) {
            return res.status(400).json({ message: 'User not found', status: 'error' });
        }

        const { productId } = req.body;
        const cart = await Cart.findOne({ user: user._id });
        if (cart) {
            cart.items = cart.items.filter(item => !item.productId.equals(productId));
            await cart.save();
            res.json({ message: 'Product removed from cart', status: 'removed' });
        } else {
            res.status(400).json({ message: 'Cart not found', status: 'error' });
        }
    } catch (error) {
        console.error('Error removing product from cart:', error);
        res.status(500).json({ error: 'Failed to remove product from cart', details: error.message });
    }
};

const updateCartQuantity = async (req, res) => {
    try {
        const user = await userBase.findOne({ email: req.session.user });
        if (!user) {
            return res.status(400).json({ message: 'User not found', status: 'error' });
        }

        const { productId, quantity } = req.body;
        const cart = await Cart.findOne({ user: user._id });
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found', status: 'error' });
        }

        if (quantity > product.product_stock) {
            return res.status(400).json({ message: 'Stock limit reached hiii', status: 'error' });
        }

        if (cart) {
            const item = cart.items.find(item => item.productId.equals(productId));
            if (item) {
                item.quantity = quantity;
                await cart.save();
                res.json({ message: 'Cart updated', status: 'updated' });
            } else {
                res.status(404).json({ message: 'Product not found in cart', status: 'error' });
            }
        } else {
            res.status(400).json({ message: 'Cart not found', status: 'error' });
        }
    } catch (error) {
        console.error('Error updating cart quantity:', error);
        res.status(500).json({ error: 'Failed to update cart quantity', details: error.message });
    }
};

module.exports = {
    addToCart,
    getCart,
    removeFromCart,
    updateCartQuantity
};
