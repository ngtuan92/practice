const mongoose = require('mongoose');

const Order = require('../models/order');
const Customer = require('../models/customer');
const Product = require('../models/product');

const validateOrderData = async (data) => {
    const {
        customer_id,
        items,
        payment_method,
        status,
        order_date
    } = data;

    if (
        !customer_id ||
        !items ||
        !payment_method ||
        !status ||
        !order_date
    ) {
        return {
            valid: false,
            status: 400,
            message: 'customer_id, items, payment_method, status and order_date are required'
        };
    }

    if (!mongoose.Types.ObjectId.isValid(customer_id)) {
        return {
            valid: false,
            status: 400,
            message: 'Invalid customer_id'
        };
    }

    if (!Array.isArray(items) || items.length === 0) {
        return {
            valid: false,
            status: 400,
            message: 'Order must contain at least one item'
        };
    }

    const customer = await Customer.findById(customer_id);

    if (!customer) {
        return {
            valid: false,
            status: 404,
            message: 'Customer not found'
        };
    }

    const calculatedItems = [];
    let totalAmount = 0;

    for (const item of items) {
        if (!item.product_id) {
            return {
                valid: false,
                status: 400,
                message: 'product_id is required'
            };
        }

        if (!mongoose.Types.ObjectId.isValid(item.product_id)) {
            return {
                valid: false,
                status: 400,
                message: 'Invalid product_id'
            };
        }

        if (
            !Number.isInteger(item.quantity) ||
            item.quantity < 1
        ) {
            return {
                valid: false,
                status: 400,
                message: 'quantity must be an integer greater than or equal to 1'
            };
        }

        const product = await Product.findById(item.product_id);

        if (!product) {
            return {
                valid: false,
                status: 404,
                message: `Product ${item.product_id} not found`
            };
        }

        if (item.quantity > product.stock) {
            return {
                valid: false,
                status: 400,
                message: `Requested quantity for ${product.name} exceeds available stock`
            };
        }

        const itemTotal = product.price * item.quantity;

        calculatedItems.push({
            product_id: product._id,
            quantity: item.quantity,
            price_at_order: product.price,
            total: itemTotal
        });

        totalAmount += itemTotal;
    }

    return {
        valid: true,
        customer,
        items: calculatedItems,
        total_amount: totalAmount,
        payment_method,
        status,
        order_date
    };
};

const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find()
            .populate('customer_id')
            .populate('items.product_id');

        return res.status(200).json(orders);

    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
};

const getOrderById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(404).json({
                message: 'Order not found'
            });
        }

        const order = await Order.findById(id)
            .populate('customer_id')
            .populate('items.product_id');

        if (!order) {
            return res.status(404).json({
                message: 'Order not found'
            });
        }

        return res.status(200).json(order);

    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
};

const createOrder = async (req, res) => {
    try {
        const result = await validateOrderData(req.body);

        if (!result.valid) {
            return res.status(result.status).json({
                message: result.message
            });
        }

        const order = await Order.create({
            customer_id: req.body.customer_id,
            items: result.items,
            total_amount: result.total_amount,
            payment_method: result.payment_method,
            status: result.status,
            order_date: result.order_date
        });

        const populatedOrder = await Order.findById(order._id)
            .populate('customer_id')
            .populate('items.product_id');

        return res.status(201).json(populatedOrder);

    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
};

const updateOrder = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(404).json({
                message: 'Order not found'
            });
        }

        const existingOrder = await Order.findById(id);

        if (!existingOrder) {
            return res.status(404).json({
                message: 'Order not found'
            });
        }

        const result = await validateOrderData(req.body);

        if (!result.valid) {
            return res.status(result.status).json({
                message: result.message
            });
        }

        existingOrder.customer_id = req.body.customer_id;
        existingOrder.items = result.items;
        existingOrder.total_amount = result.total_amount;
        existingOrder.payment_method = result.payment_method;
        existingOrder.status = result.status;
        existingOrder.order_date = result.order_date;

        await existingOrder.save();

        const populatedOrder = await Order.findById(id)
            .populate('customer_id')
            .populate('items.product_id');

        return res.status(200).json(populatedOrder);

    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
};

const deleteOrder = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(404).json({
                message: 'Order not found'
            });
        }

        const order = await Order.findByIdAndDelete(id);

        if (!order) {
            return res.status(404).json({
                message: 'Order not found'
            });
        }

        return res.status(200).json({
            message: 'Order deleted successfully'
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
};

module.exports = {
    getAllOrders,
    getOrderById,
    createOrder,
    updateOrder,
    deleteOrder
};