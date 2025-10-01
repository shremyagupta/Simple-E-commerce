# Simple E-commerce Store with MongoDB

A basic e-commerce web application with product browsing, shopping cart, Stripe payment integration, and MongoDB database.

## Features

- 🛍️ Product catalog stored in MongoDB
- 🛒 Shopping cart functionality with stock management
- ➕➖ Add/remove items and adjust quantities
- � Real-time stock tracking
- �💳 Stripe checkout integration
- 📱 Responsive design
- ✅ Success page after payment
- 🔄 Automatic stock updates after purchase
- 📦 Order tracking and management

## Prerequisites

- **Node.js** (v14 or higher)
- **MongoDB** (local installation or MongoDB Atlas)
- **Stripe Account** (for payment processing)

## Setup Instructions

### 1. Install Dependencies

```bash
cd simple-ecommerce
npm install
```

### 2. Set Up MongoDB

**Option A: Local MongoDB**
- Install MongoDB locally
- Start MongoDB service: `mongod`

**Option B: MongoDB Atlas**
- Create account at [MongoDB Atlas](https://www.mongodb.com/atlas)
- Create a cluster and get connection string
- Update `.env` file with your Atlas URI

### 3. Configure Environment Variables

Update `.env` file with your actual values:

```env
MONGODB_URI=mongodb://localhost:27017/simple-ecommerce
STRIPE_SECRET_KEY=sk_test_your_actual_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_actual_stripe_publishable_key
PORT=3001
NODE_ENV=development
```

### 4. Configure Stripe Keys

**In `script.js`** (line 2):
```javascript
const STRIPE_PUBLISHABLE_KEY = 'pk_test_your_actual_stripe_publishable_key';
```

### 5. Seed the Database

```bash
npm run seed
```

This will populate MongoDB with 8 sample products.

### 6. Run the Application

```bash
npm start
```

The application will be available at: http://localhost:3001

## 🎭 Demo Mode

The application automatically detects if Stripe is properly configured:

**Demo Mode (Default):**
- ⚠️ Runs when Stripe keys are not configured
- 🎭 Simulates payment processing (no real money charged)
- ✅ Still updates inventory and creates orders
- 🕐 2-second simulated payment delay
- 📄 Shows demo banner on the website

**Live Mode:**
- 💳 Runs when real Stripe keys are configured
- 🔒 Processes real payments through Stripe
- 🚀 Full production functionality

### How It Works

1. **Products**: Loaded from MongoDB database
2. **Shopping Cart**: Full functionality with stock validation
3. **Checkout Process**:
   - Demo Mode: Simulates payment, updates inventory
   - Live Mode: Redirects to Stripe's secure checkout
4. **Order Tracking**: All orders saved to database
5. **Stock Management**: Automatic inventory updates

## Testing the Application

### Demo Mode Testing (No Stripe keys needed)
1. Browse products and add to cart
2. Click "Checkout with Stripe"
3. See "Demo Mode: Simulating payment process..." message
4. Wait 2 seconds for simulated processing
5. Get redirected to success page
6. Check that inventory is updated

### Live Mode Testing (Requires Stripe keys)
1. Configure real Stripe API keys
2. Use test card numbers from Stripe documentation:
   - Success: `4242 4242 4242 4242`
   - Decline: `4000 0000 0000 0002`
   - 3D Secure: `4000 0027 6000 3184`
3. Use any future expiry, any 3-digit CVC, any ZIP code

## How It Works

1. **Product Display**: Sample products are loaded from the `products` array in `script.js`
2. **Shopping Cart**: Items are stored in browser memory with quantity management
3. **Stripe Integration**: 
   - Frontend creates checkout session via `/create-checkout-session` endpoint
   - Backend creates Stripe session and returns session ID
   - User is redirected to Stripe's hosted checkout page
   - After payment, user returns to success page

## Stripe Integration Details

The application uses Stripe's Checkout Sessions API:

- **Frontend**: Uses Stripe.js to redirect to checkout
- **Backend**: Creates checkout sessions with product details
- **Payment Flow**: Hosted on Stripe's secure servers
- **Success Handling**: Automatic redirect after successful payment

## Sample Products

The application includes 6 sample products:
- Wireless Headphones ($99.99)
- Smart Watch ($199.99)
- Laptop Stand ($49.99)
- Wireless Mouse ($29.99)
- USB-C Hub ($79.99)
- Phone Case ($24.99)

## Testing Payments

Use Stripe's test card numbers:
- **Success**: 4242 4242 4242 4242
- **Decline**: 4000 0000 0000 0002
- **3D Secure**: 4000 0027 6000 3184

Use any future expiry date, any 3-digit CVC, and any ZIP code.

## Customization

### Adding Products
Edit the `products` array in `script.js`:

```javascript
const products = [
    {
        id: 7,
        name: "Your Product",
        description: "Product description",
        price: 29.99,
        image: "https://example.com/image.jpg"
    }
];
```

### Styling
Modify `styles.css` to change the appearance.

### Server Configuration
The server runs on port 3001 by default. Change in `server.js`:

```javascript
const PORT = process.env.PORT || 3001;
```

## Security Notes

- Never commit your actual Stripe secret keys to version control
- Use environment variables for production deployment
- The current setup is for development/testing only
- For production, implement proper error handling and logging

## Next Steps

- Add user authentication
- Implement inventory management
- Add product categories and search
- Store orders in a database
- Add email confirmations
- Implement webhooks for payment verification