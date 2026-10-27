const mongoose = require('mongoose');

const Product = require('../models/product');
const Order = require('../models/order');

const getAllProducts = async (req, res) => {
    try {
        const products = await Product.find();

        return res.status(200).json(products);

    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
};

const getProductById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(404).json({
                message: 'Product not found'
            });
        }

        const product = await Product.findById(id);

        if (!product) {
            return res.status(404).json({
                message: 'Product not found'
            });
        }

        return res.status(200).json(product);

    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
};

const createProduct = async (req, res) => {
    try {
        const {
            name,
            price,
            category,
            stock
        } = req.body;

        if (
            !name ||
            price === undefined ||
            !category ||
            stock === undefined
        ) {
            return res.status(400).json({
                message: 'name, price, category and stock are required'
            });
        }

        if (typeof price !== 'number' || price < 0) {
            return res.status(400).json({
                message: 'price must be a number greater than or equal to 0'
            });
        }

        if (typeof stock !== 'number' || stock < 0) {
            return res.status(400).json({
                message: 'stock must be a number greater than or equal to 0'
            });
        }

        const product = await Product.create({
            name,
            price,
            category,
            stock
        });

        return res.status(201).json(product);

    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
};

const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(404).json({
                message: 'Product not found'
            });
        }

        const {
            name,
            price,
            category,
            stock
        } = req.body;

        if (
            name === undefined &&
            price === undefined &&
            category === undefined &&
            stock === undefined
        ) {
            return res.status(400).json({
                message: 'At least one field is required'
            });
        }

        if (price !== undefined) {
            if (typeof price !== 'number' || price < 0) {
                return res.status(400).json({
                    message: 'price must be a number greater than or equal to 0'
                });
            }
        }

        if (stock !== undefined) {
            if (typeof stock !== 'number' || stock < 0) {
                return res.status(400).json({
                    message: 'stock must be a number greater than or equal to 0'
                });
            }
        }

        const product = await Product.findByIdAndUpdate(
            id,
            {
                name,
                price,
                category,
                stock
            },
            {
                new: true,
                runValidators: true
            }
        );

        if (!product) {
            return res.status(404).json({
                message: 'Product not found'
            });
        }

        return res.status(200).json(product);

    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
};

const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(404).json({
                message: 'Product not found'
            });
        }

        const product = await Product.findById(id);

        if (!product) {
            return res.status(404).json({
                message: 'Product not found'
            });
        }

        const referencedOrder = await Order.findOne({
            'items.product_id': id
        });

        if (referencedOrder) {
            return res.status(409).json({
                message: 'Cannot delete product because it is referenced by an order'
            });
        }

        await Product.findByIdAndDelete(id);

        return res.status(200).json({
            message: 'Product deleted successfully'
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
};

module.exports = {
    getAllProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
};