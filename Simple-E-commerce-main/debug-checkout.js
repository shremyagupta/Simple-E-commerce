require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

async function testCheckoutWithImages() {
    try {
        console.log('Testing checkout with local images...');
        
    
        const lineItems = [{
            price_data: {
                currency: 'usd',
                product_data: {
                    name: 'Wireless Headphones',
                    description: 'High-quality wireless headphones',
                    images: ['http://localhost:3001/images/headphones.svg'],
                },
                unit_amount: 9999, 
            },
            quantity: 1
        }];
        
        console.log('Line items:', JSON.stringify(lineItems, null, 2));
        
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: lineItems,
            mode: 'payment',
            success_url: 'http://localhost:3001/success?session_id={CHECKOUT_SESSION_ID}',
            cancel_url: 'http://localhost:3001/cancel',
        });
        
        console.log('✅ Checkout session created successfully!');
        console.log('Session ID:', session.id);
        console.log('Session URL:', session.url);
        
    } catch (error) {
        console.error('❌ Detailed Error Information:');
        console.error('Message:', error.message);
        console.error('Type:', error.type);
        console.error('Code:', error.code);
        console.error('Param:', error.param);
        console.error('Request ID:', error.requestId);
        
        if (error.detail) {
            console.error('Detail:', error.detail);
        }
        

        console.log('\n--- Trying without images ---');
        try {
            const sessionNoImages = await stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                line_items: [{
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: 'Wireless Headphones',
                            description: 'High-quality wireless headphones',
                        },
                        unit_amount: 9999,
                    },
                    quantity: 1
                }],
                mode: 'payment',
                success_url: 'http://localhost:3001/success?session_id={CHECKOUT_SESSION_ID}',
                cancel_url: 'http://localhost:3001/cancel',
            });
            console.log('✅ Session without images works:', sessionNoImages.id);
        } catch (noImageError) {
            console.error('❌ Even without images failed:', noImageError.message);
        }
    }
}

testCheckoutWithImages();
