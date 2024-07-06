const orderBase = require("../../models/orderModel");
const userBase=require("../../models/usermodel")

// Fetch order items
const orderItems = async (req, res) => {
    try {
        const user = await userBase.findOne({ email: req.session.user });
        const page = parseInt(req.query.page) || 1;
        const perPage = 6;
        const startIndex = (page - 1) * perPage;

        const order = await orderBase.find({ user_id: user._id })
            .skip(startIndex)
            .limit(perPage)
            .populate('orderedItems');

        const totalOrders = await orderBase.countDocuments({ user_id: user._id });
        const totalPages = Math.ceil(totalOrders / perPage);

        if (!order) {
            return res.status(404).send('Order not found');
        }

        res.render('user/orderStatus', {
            order,
            status: true,
            page,
            totalPages,
            perPage // Pass perPage to the view
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
};

// Cancel order
const cancelOrder = async (req, res) => {
    try {
        const { orderId, reason } = req.body;
        const order = await orderBase.findById(orderId);

        if (!order) {
            return res.status(404).json({ message: 'Order not found', status: 'error' });
        }

        if (order.status === 'Cancelled' || order.status === 'Returned') {
            return res.status(400).json({ message: 'Order already processed', status: 'error' });
        }

        order.status = 'Cancelled';
        order.cancellationReason = reason;
        await order.save();

        res.json({ message: 'Order cancelled successfully', status: 'cancelled' });
    } catch (error) {
        console.error('Error cancelling order:', error);
        res.status(500).json({ message: 'Failed to cancel order', status: 'error', details: error.message });
    }
};

// Return order
const returnOrder = async (req, res) => {
    try {
        const { orderId } = req.body;
        const order = await orderBase.findById(orderId);

        if (!order) {
            return res.status(404).json({ message: 'Order not found', status: 'error' });
        }

        if (order.status === 'cancelled' || order.status === 'Returned') {
            return res.status(400).json({ message: 'Order already processed', status: 'error' });
        }

        order.status = 'Returned';
        await order.save();

        res.json({ message: 'Order returned successfully', status: 'returned' });
    } catch (error) {
        console.error('Error returning order:', error);
        res.status(500).json({ message: 'Failed to return order', status: 'error', details: error.message });
    }
};

module.exports = {
    orderItems,
    cancelOrder,
    returnOrder
};
