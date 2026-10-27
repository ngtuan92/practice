const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema(
    {
        product_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },

        quantity: {
            type: Number,
            required: true,
            min: 1
        },

        price_at_order: {
            type: Number,
            required: true,
            min: 0
        },

        total: {
            type: Number,
            required: true,
            min: 0
        }
    },
    {
        _id: false
    }
);

const orderSchema = new mongoose.Schema(
    {
        customer_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Customer',
            required: true
        },

        items: {
            type: [orderItemSchema],
            required: true,
            validate: {
                validator: function (items) {
                    return items.length >= 1;
                },
                message: 'Order must contain at least one item'
            }
        },

        total_amount: {
            type: Number,
            required: true,
            min: 0
        },

        payment_method: {
            type: String,
            required: true,
            trim: true
        },

        status: {
            type: String,
            required: true,
            trim: true
        },

        order_date: {
            type: Date,
            required: true
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model('Order', orderSchema);