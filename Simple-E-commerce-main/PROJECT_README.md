# 🛍️ Simple E-commerce Application

[![Node.js](https://img.shields.io/badge/Node.js-18.x-green.svg)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Latest-green.svg)](https://www.mongodb.com/)
[![Stripe](https://img.shields.io/badge/Stripe-API-blue.svg)](https://stripe.com/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

A full-stack e-commerce web application built with Node.js, Express, MongoDB, and Stripe payment integration. Features both demo mode for testing and live payment processing.

## 🚀 Features

### Core Functionality
- 🛒 **Shopping Cart System** - Add, remove, and manage cart items
- 📦 **Product Catalog** - MongoDB-powered product management
- 💳 **Payment Processing** - Stripe integration with demo mode
- 📊 **Inventory Management** - Real-time stock tracking
- 📱 **Responsive Design** - Mobile-friendly interface
- 🔄 **Order Management** - Complete order lifecycle tracking

### Payment Modes
- 🎭 **Demo Mode** - Test without real payments (default)
- 💰 **Live Mode** - Real Stripe payment processing
- ✅ **Automatic Detection** - Seamlessly switches based on API key configuration

### Technical Features
- 🗄️ **MongoDB Integration** - Persistent data storage
- 🔒 **Secure API** - Environment variable configuration
- 📡 **RESTful APIs** - Clean API endpoints
- 🎨 **Modern UI** - Clean, intuitive design
- 🔍 **Error Handling** - Comprehensive error management

## 🛠️ Technology Stack

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **Stripe** - Payment processing

### Frontend
- **HTML5** - Semantic markup
- **CSS3** - Modern styling with animations
- **Vanilla JavaScript** - No framework dependencies
- **Stripe.js** - Client-side payment handling

## 📋 Prerequisites

Before running this application, make sure you have:

- **Node.js** (v14 or higher) - [Download](https://nodejs.org/)
- **MongoDB** - [Local installation](https://docs.mongodb.com/manual/installation/) or [MongoDB Atlas](https://www.mongodb.com/atlas)
- **Stripe Account** - [Sign up](https://stripe.com) for API keys (optional for demo mode)

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/shremyagupta/Simple-E-commerce.git
cd Simple-E-commerce
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup
```bash
# Copy and configure environment variables
cp .env.example .env
# Edit .env with your MongoDB URI and Stripe keys (optional)
```

### 4. Seed Database
```bash
npm run seed
```

### 5. Start the Application
```bash
npm start
```

🎉 **Application will be running at:** http://localhost:3001

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/simple-ecommerce

# Stripe Configuration (Optional - defaults to demo mode)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here

# Server Configuration
PORT=3001
NODE_ENV=development
```

### Stripe Configuration

For live payments, update both:
1. **Backend** - Set `STRIPE_SECRET_KEY` in `.env`
2. **Frontend** - Update `STRIPE_PUBLISHABLE_KEY` in `script.js`

## 🎭 Demo Mode vs Live Mode

### Demo Mode (Default)
- ✅ No Stripe keys required
- 🎭 Simulates payment processing
- ⚡ 2-second payment delay
- 💾 Updates inventory and saves orders
- 🔄 Perfect for testing and demonstrations

### Live Mode
- 🔑 Requires valid Stripe API keys
- 💳 Processes real payments
- 🛡️ Secure Stripe-hosted checkout
- 📧 Real customer data handling

## 📚 API Endpoints

### Products
- `GET /api/products` - Get all products
- `POST /api/products` - Create new product
- `GET /api/products/:id` - Get single product
- `PATCH /api/products/:id/stock` - Update product stock

### Orders
- `GET /api/orders` - Get all orders
- `POST /create-checkout-session` - Create payment session
- `POST /complete-demo-checkout` - Complete demo payment

### Utility
- `GET /health` - Server health check
- `GET /success.html` - Payment success page

## 🧪 Testing

### Demo Mode Testing
1. Add products to cart
2. Click "Checkout with Stripe"
3. Watch demo payment simulation
4. Verify inventory updates

### Live Mode Testing
Use Stripe test cards:
- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **3D Secure**: `4000 0027 6000 3184`

## 📁 Project Structure

```
simple-ecommerce/
├── 📄 index.html          # Main HTML page
├── 🎨 styles.css          # CSS styling
├── ⚡ script.js           # Frontend JavaScript
├── 🖥️ server.js           # Express server
├── 🗃️ models.js           # MongoDB schemas
├── 🌱 seed.js             # Database seeding
├── 📦 package.json        # Dependencies
├── 🔧 .env                # Environment variables
├── 🚫 .gitignore          # Git ignore rules
└── 📖 README.md           # Documentation
```

## 🌟 Key Features Explained

### Automatic Mode Detection
The application automatically detects whether you have configured Stripe keys:
- **Demo Mode**: Shows demo banner, simulates payments
- **Live Mode**: Removes demo banner, processes real payments

### Stock Management
- Real-time inventory tracking
- Prevents overselling
- Automatic stock updates after purchase
- Visual stock indicators

### Responsive Design
- Mobile-first approach
- Touch-friendly interface
- Smooth animations
- Cross-browser compatibility

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Stripe](https://stripe.com/) for payment processing
- [MongoDB](https://www.mongodb.com/) for database solutions
- [Express.js](https://expressjs.com/) for the web framework
- [Unsplash](https://unsplash.com/) for product images

## 📞 Support

If you have any questions or need help getting started:

1. Check the [Issues](https://github.com/shremyagupta/Simple-E-commerce/issues) page
2. Create a new issue if your question isn't answered
3. Star ⭐ this repository if you find it helpful!

---

**Built with ❤️ by [shremyagupta](https://github.com/shremyagupta)**