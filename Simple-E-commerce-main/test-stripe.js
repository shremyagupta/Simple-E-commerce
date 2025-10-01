require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

async function testStripe() {
    try {
        console.log('Testing Stripe API keys...');
        console.log('Secret Key (first 10 chars):', process.env.STRIPE_SECRET_KEY?.substring(0, 10));
        console.log('Publishable Key (first 10 chars):', process.env.STRIPE_PUBLISHABLE_KEY?.substring(0, 10));
        
    
        console.log('\n--- Test 1: Simple checkout session ---');
        const session1 = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: 'Test Product',
                    },
                    unit_amount: 2000, 
                },
                quantity: 1,
            }],
            mode: 'payment',
            success_url: 'http://localhost:3001/success',
            cancel_url: 'http://localhost:3001/cancel',
        });
        console.log('✅ Simple session created:', session1.id);
        
    
        console.log('\n--- Test 2: Session with product images ---');
        const session2 = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: 'Wireless Headphones',
                        description: 'High-quality wireless headphones',
                        images: ['http://localhost:3001/images/headphones.svg'],
                    },
                    unit_amount: 9999, 
                },
                quantity: 1,
            }],
            mode: 'payment',
            success_url: 'http://localhost:3001/success?session_id={CHECKOUT_SESSION_ID}',
            cancel_url: 'http://localhost:3001/cancel',
        });
        console.log('✅ Image session created:', session2.id);
        
        console.log('\n🎉 All Stripe tests passed!');
        
    } catch (error) {
        console.error('\n❌ Stripe API Error:', error.message);
        console.error('Error Code:', error.code);
        console.error('Error Type:', error.type);
        console.error('Error Param:', error.param);
        console.error('Full Error:', JSON.stringify(error, null, 2));
    }
}

testStripe();
