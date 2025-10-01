const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();


const stripeSecretKey = process.env.STRIPE_SECRET_KEY
const isStripeConfigured = stripeSecretKey && !stripeSecretKey.includes('your_stripe_secret_key_here');

let stripe;
if (isStripeConfigured) {
    stripe = require('stripe')(stripeSecretKey);
    console.log('💳 Stripe configured with real API keys');
} else {
    console.log('⚠️ Demo mode: Using placeholder Stripe keys. Checkout will simulate payment.');
}

const { Product, Order } = require('./models');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use(cors());

app.use((req, res, next) => {
    res.setHeader(
        'Content-Security-Policy',
        "default-src 'self'; " +
        "script-src 'self' https://js.stripe.com 'unsafe-inline' 'unsafe-eval'; " +
        "style-src 'self' https://js.stripe.com 'unsafe-inline' 'sha256-uCxvtFawfWxk2UCSg0h0hGlfg37QT0S1VJB19HooWNE=' 'sha256-w6VV9S31WXWMmczUBQt44E60bgweTtur7SUfnTbDk60=' 'sha256-g9xQTc8J91MeKZQsP2EWEmFqODFIz6s31HZDpDWgg1U='; " +
        "img-src 'self' https://*.stripe.com https://q.stripe.com data:; " +
        "connect-src 'self' https://api.stripe.com https://m.stripe.com https://m.stripe.network https://b.stripecdn.com; " +
        "frame-src 'self' https://js.stripe.com https://hooks.stripe.com https://m.stripe.com https://m.stripe.network; " +
        "font-src 'self' https://fonts.gstatic.com https://js.stripe.com;"
    );
    next();
});

app.use(express.static(path.join(__dirname)));


const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/simple-ecommerce';
mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => {
    console.log('📦 MongoDB connected successfully');
    console.log(`🔗 Database: ${mongoURI}`);
})
.catch(err => {
    console.error('❌ MongoDB connection error:', err);
    console.log('⚠️  Make sure MongoDB is running on your system');
});


app.get('/config', (req, res) => {
    res.json({
        publishableKey: process.env.STRIPE_PUBLISHABLE_KEY
    });
});


app.get('/api/products', async (req, res) => {
    try {
        const products = await Product.find().sort({ createdAt: -1 });
        res.json(products);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ error: 'Failed to fetch products' });
    }
});

app.get('/api/products/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json(product);
    } catch (error) {
        console.error('Error fetching product:', error);
        res.status(500).json({ error: 'Failed to fetch product' });
    }
});

app.post('/api/products', async (req, res) => {
    try {
        const product = new Product(req.body);
        const savedProduct = await product.save();
        res.status(201).json(savedProduct);
    } catch (error) {
        console.error('Error creating product:', error);
        res.status(500).json({ error: 'Failed to create product' });
    }
});


app.patch('/api/products/:id/stock', async (req, res) => {
    try {
        const { stock } = req.body;
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            { stock },
            { new: true }
        );
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json(product);
    } catch (error) {
        console.error('Error updating stock:', error);
        res.status(500).json({ error: 'Failed to update stock' });
    }
});

app.post('/create-checkout-session', async (req, res) => {
    try {
        console.log('🛒 Checkout session requested');
        console.log('Request body:', JSON.stringify(req.body, null, 2));
        
        const { line_items, product_metadata, success_url, cancel_url } = req.body;

        
        if (!isStripeConfigured) {
            console.log('🎭 Demo mode: Simulating checkout session');
       
            const demoSessionId = 'cs_demo_' + Date.now();
      
            const orderItems = line_items.map((item, index) => ({
                productId: product_metadata?.[index]?.productId,
                name: item.price_data.product_data.name,
                price: item.price_data.unit_amount / 100,
                quantity: item.quantity,
                image: item.price_data.product_data.images?.[0] || ''
            }));

            const totalAmount = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

            const order = new Order({
                items: orderItems,
                totalAmount,
                stripeSessionId: demoSessionId,
                status: 'pending'
            });

            await order.save();
            
            return res.json({ 
                id: demoSessionId,
                demo: true,
                message: 'Demo mode - no real payment will be processed'
            });
        }

       
        if (product_metadata) {
            for (const metadata of product_metadata) {
                const productId = metadata.productId;
                if (productId) {
                    const product = await Product.findById(productId);
                    if (!product) {
                        return res.status(400).json({ error: `Product not found: ${productId}` });
                    }
                    if (product.stock < metadata.quantity) {
                        return res.status(400).json({ 
                            error: `Insufficient stock for ${product.name}. Available: ${product.stock}` 
                        });
                    }
                }
            }
        }

    
        const stripeLineItems = line_items.map(item => ({
            price_data: item.price_data,
            quantity: item.quantity
        }));

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: stripeLineItems,
            mode: 'payment',
            success_url: success_url || `${req.headers.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: cancel_url || `${req.headers.origin}/cart`,
            billing_address_collection: 'auto',
            shipping_address_collection: {
                allowed_countries: ['US', 'CA', 'GB', 'AU', 'IN', 'HK']
            }
        });

      
        const orderItems = await Promise.all(line_items.map(async (item, index) => {
        
            const metadata = product_metadata?.[index];
            if (metadata?.productId) {
                try {
                    const product = await Product.findById(metadata.productId);
                    if (product) {
                        return {
                            productId: product._id,
                            name: product.name,
                            price: product.price,
                            quantity: item.quantity,
                            image: product.image
                        };
                    }
                } catch (error) {
                    console.error('Error fetching product:', error);
                }
            }
            
            
            return {
                productId: metadata?.productId || new mongoose.Types.ObjectId(),
                name: item.price_data?.product_data?.name || 'Unknown Product',
                price: (item.price_data?.unit_amount || 0) / 100,
                quantity: item.quantity || 1,
                image: item.price_data?.product_data?.images?.[0] || ''
            };
        }));

        const totalAmount = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        const order = new Order({
            items: orderItems,
            totalAmount,
            stripeSessionId: session.id,
            status: 'pending'
        });

        await order.save();

        res.json({ id: session.id });
    } catch (error) {
        console.error('❌ Error creating checkout session:', error);
        console.error('Error details:', {
            message: error.message,
            code: error.code,
            type: error.type,
            stack: error.stack
        });
        res.status(500).json({ 
            error: 'Failed to create checkout session',
            details: error.message,
            suggestion: 'Please check your Stripe API keys in the .env file'
        });
    }
});

app.post('/complete-demo-checkout', async (req, res) => {
    try {
        const { sessionId } = req.body;
        
        if (!sessionId.startsWith('cs_demo_')) {
            return res.status(400).json({ error: 'Invalid demo session' });
        }

    
        const order = await Order.findOneAndUpdate(
            { stripeSessionId: sessionId },
            { 
                status: 'completed',
                customerEmail: 'demo@example.com'
            },
            { new: true }
        );

        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

    
        for (const item of order.items) {
            if (item.productId) {
                await Product.findByIdAndUpdate(
                    item.productId,
                    { $inc: { stock: -item.quantity } }
                );
            }
        }

        console.log('✅ Demo payment completed for session:', sessionId);
        res.json({ success: true, order });
    } catch (error) {
        console.error('Error completing demo checkout:', error);
        res.status(500).json({ error: error.message });
    }
});
app.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
        if (endpointSecret) {
            event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
        } else {
            console.log('⚠️ No webhook secret configured, parsing raw event');
            event = JSON.parse(req.body);
        }
    } catch (err) {
        console.log(`Webhook signature verification failed.`, err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

   
    switch (event.type) {
        case 'checkout.session.completed':
            const session = event.data.object;
            
            
            await Order.findOneAndUpdate(
                { stripeSessionId: session.id },
                { 
                    status: 'completed',
                    customerEmail: session.customer_details?.email
                }
            );

            const order = await Order.findOne({ stripeSessionId: session.id });
            if (order) {
                for (const item of order.items) {
                    if (item.productId) {
                        await Product.findByIdAndUpdate(
                            item.productId,
                            { $inc: { stock: -item.quantity } }
                        );
                    }
                }
            }

            console.log('✅ Payment completed for session:', session.id);
            break;
        
        case 'checkout.session.expired':
           
            await Order.findOneAndUpdate(
                { stripeSessionId: event.data.object.id },
                { status: 'cancelled' }
            );
            console.log('❌ Payment session expired:', event.data.object.id);
            break;

        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
});

app.get('/api/orders', async (req, res) => {
    try {
        const orders = await Order.find().sort({ createdAt: -1 }).populate('items.productId');
        res.json(orders);
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/success.html', (req, res) => {
    const isDemo = req.query.demo === 'true';
    const sessionId = req.query.session_id || '';
    
    const titleText = isDemo ? '🎭 Demo Payment Successful!' : '✅ Payment Successful!';
    const messageText = isDemo ? 
        'Thank you for testing our demo! No real payment was processed.' : 
        'Thank you for your purchase. Your order has been confirmed and will be processed shortly.';
    const demoNotice = isDemo ? 
        '<p style="margin-bottom: 20px; color: #f39c12; font-weight: bold;">🎭 DEMO MODE - No real money was charged</p>' : 
        '';
    
    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${isDemo ? 'Demo ' : ''}Payment Success</title>
            <link rel="stylesheet" href="styles.css">
        </head>
        <body>
            <div class="container">
                <div style="text-align: center; padding: 50px; background: white; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                    <h1 style="color: #27ae60; margin-bottom: 20px;">${titleText}</h1>
                    ${demoNotice}
                    <p style="margin-bottom: 30px; font-size: 1.2rem;">${messageText}</p>
                    <p style="margin-bottom: 30px; color: #666;">Order ID: <span id="session-id" style="font-family: monospace;">${sessionId}</span></p>
                    <a href="/" style="display: inline-block; background: #3498db; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-size: 1.1rem;">Continue Shopping</a>
                </div>
            </div>
        </body>
        </html>
    `);
});


app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'Server is running',
        database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
        demo: !isStripeConfigured,
        stripeConfigured: isStripeConfigured,
        timestamp: new Date().toISOString()
    });
});

if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`🚀 Server running on http://localhost:${PORT}`);
        console.log(`📄 Open http://localhost:${PORT} to view the store`);
        console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
}


module.exports = app;