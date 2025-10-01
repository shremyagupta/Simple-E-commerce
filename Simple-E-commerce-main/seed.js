const mongoose = require('mongoose');
require('dotenv').config();
const { Product } = require('./models');

const sampleProducts = [
    {
        name: "Wireless Headphones",
        description: "High-quality wireless headphones with active noise cancellation and 30-hour battery life",
        price: 99.99,
        image: "/images/headphones.svg",
        category: "Audio",
        stock: 50
    },
    {
        name: "Smart Watch",
        description: "Feature-rich smartwatch with health monitoring, GPS, and waterproof design",
        price: 199.99,
        image: "/images/smartwatch.svg",
        category: "Wearables",
        stock: 30
    },
    {
        name: "Laptop Stand",
        description: "Ergonomic aluminum laptop stand for better posture and improved airflow",
        price: 49.99,
        image: "/images/laptop-stand.svg",
        category: "Accessories",
        stock: 100
    },
    {
        name: "Wireless Mouse",
        description: "Precise wireless mouse with 2.4GHz connectivity and long battery life",
        price: 29.99,
        image: "/images/mouse.svg",
        category: "Accessories",
        stock: 75
    },
    {
        name: "USB-C Hub",
        description: "Multi-port USB-C hub with 4K HDMI output, USB 3.0 ports, and fast charging",
        price: 79.99,
        image: "/images/usb-hub.svg",
        category: "Accessories",
        stock: 40
    },
    {
        name: "Phone Case",
        description: "Protective phone case with wireless charging support and drop protection",
        price: 24.99,
        image: "/images/phone-case.svg",
        category: "Accessories",
        stock: 200
    },
    {
        name: "Bluetooth Speaker",
        description: "Portable Bluetooth speaker with 360-degree sound and waterproof design",
        price: 59.99,
        image: "/images/speaker.svg",
        category: "Audio",
        stock: 60
    },
    {
        name: "Webcam HD",
        description: "1080p HD webcam with auto-focus and built-in microphone for video calls",
        price: 39.99,
        image: "/images/webcam.svg",
        category: "Electronics",
        stock: 25
    }
];

async function seedDatabase() {
    try {
        
        const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/simple-ecommerce';
        await mongoose.connect(mongoURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        console.log('📦 Connected to MongoDB');

       
        await Product.deleteMany({});
        console.log('🗑️  Cleared existing products');

       
        const insertedProducts = await Product.insertMany(sampleProducts);
        console.log(`✅ Inserted ${insertedProducts.length} sample products:`);
        
        insertedProducts.forEach(product => {
            console.log(`   - ${product.name} ($${product.price}) - Stock: ${product.stock}`);
        });

        console.log('\n🎉 Database seeded successfully!');
        console.log('🚀 You can now start the server with: npm start');

    } catch (error) {
        console.error('❌ Error seeding database:', error);
    } finally {
        await mongoose.connection.close();
        console.log('📦 Database connection closed');
    }
}

seedDatabase();