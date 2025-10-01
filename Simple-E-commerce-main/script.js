
let stripe;

async function loadConfig() {
    try {
        console.log('Loading Stripe configuration...');
        const response = await fetch('/config');
        const config = await response.json();
        console.log('Config received:', { publishableKey: config.publishableKey?.substring(0, 10) + '...' });
        
        if (!config.publishableKey) {
            throw new Error('No publishable key received from server');
        }
        
        stripe = Stripe(config.publishableKey);
        console.log('✅ Stripe initialized successfully');
    } catch (error) {
        console.error('❌ Failed to load configuration:', error);
        showMessage('Failed to initialize payment system', 'error');
    }
}
document.addEventListener('DOMContentLoaded', function() {
    loadConfig().then(() => {
        loadProductsFromAPI();
        updateCartDisplay();
        updateCartCount();
        checkDemoMode();
    });
});


let products = [];
let cart = [];


document.addEventListener('DOMContentLoaded', function() {
    loadProductsFromAPI();
    updateCartDisplay();
    updateCartCount();
    checkDemoMode();
});


async function checkDemoMode() {
    try {
        const response = await fetch('/health');
        const health = await response.json();
        
      
        if (health.demo || window.location.search.includes('demo')) {
            showDemoBanner();
        }
    } catch (error) {
        console.log('Could not check server status');
    }
}


function showDemoBanner() {
    const banner = document.getElementById('demo-banner');
    if (banner) {
        banner.classList.remove('hidden');
    }
}


function closeDemoBanner() {
    const banner = document.getElementById('demo-banner');
    if (banner) {
        banner.style.display = 'none';
    }
}

async function loadProductsFromAPI() {
    try {
        const response = await fetch('/api/products');
        if (!response.ok) {
            throw new Error('Failed to fetch products from database');
        }
        
        products = await response.json();
        
        if (products.length === 0) {
            showMessage('No products found. Please seed the database first.', 'error');
            loadSampleProducts();
        } else {
            loadProducts();
        }
    } catch (error) {
        console.error('Error loading products from API:', error);
        showMessage('Could not connect to database. Loading sample products.', 'error');
 
        loadSampleProducts();
    }
}


function loadSampleProducts() {
    products = [
        {
            _id: 'sample1',
            name: "Wireless Headphones",
            description: "High-quality wireless headphones with noise cancellation",
            price: 99.99,
            image: "/images/headphones.svg",
            stock: 50
        },
        {
            _id: 'sample2',
            name: "Smart Watch",
            description: "Feature-rich smartwatch with health monitoring",
            price: 199.99,
            image: "/images/smartwatch.svg",
            stock: 30
        },
        {
            _id: 'sample3',
            name: "Laptop Stand",
            description: "Ergonomic aluminum laptop stand for better posture",
            price: 49.99,
            image: "/images/laptop-stand.svg",
            stock: 100
        }
    ];
    loadProducts();
}


function loadProducts() {
    const productsGrid = document.getElementById('products-grid');
    productsGrid.innerHTML = '';

    products.forEach(product => {
        const productCard = createProductCard(product);
        productsGrid.appendChild(productCard);
    });
}


function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    
    const stockStatus = product.stock > 0 ? `In Stock (${product.stock})` : 'Out of Stock';
    const stockClass = product.stock > 0 ? 'in-stock' : 'out-of-stock';
    const buttonDisabled = product.stock === 0 ? 'disabled' : '';
    const buttonText = product.stock === 0 ? 'Out of Stock' : 'Add to Cart';
    
    card.innerHTML = `
        <img src="${product.image}" alt="${product.name}" onerror="this.src='https://via.placeholder.com/300x200?text=Product+Image'">
        <h3>${product.name}</h3>
        <p>${product.description}</p>
        <div class="price">$${product.price.toFixed(2)}</div>
        <div class="stock-info ${stockClass}">${stockStatus}</div>
        <button class="add-to-cart-btn" onclick="addToCart('${product._id}')" ${buttonDisabled}>
            ${buttonText}
        </button>
    `;
    return card;
}


function addToCart(productId) {
    const product = products.find(p => p._id === productId);
    if (!product) return;
    
    console.log('Adding product to cart:', { 
        id: product._id, 
        name: product.name, 
        image: product.image 
    });
    
    if (product.stock === 0) {
        showMessage('This product is out of stock!', 'error');
        return;
    }

    const existingItem = cart.find(item => item._id === productId);
    
    if (existingItem) {
        if (existingItem.quantity >= product.stock) {
            showMessage('Cannot add more items. Insufficient stock!', 'error');
            return;
        }
        existingItem.quantity += 1;
    } else {
        cart.push({
            ...product,
            quantity: 1
        });
    }

    updateCartDisplay();
    updateCartCount();
    showMessage('Product added to cart!', 'success');
}

function removeFromCart(productId) {
    cart = cart.filter(item => item._id !== productId);
    updateCartDisplay();
    updateCartCount();
    showMessage('Product removed from cart!', 'success');
}


function updateQuantity(productId, change) {
    const item = cart.find(item => item._id === productId);
    if (!item) return;

    const product = products.find(p => p._id === productId);
    const newQuantity = item.quantity + change;
    
    if (newQuantity <= 0) {
        removeFromCart(productId);
        return;
    }
    
    if (newQuantity > product.stock) {
        showMessage(`Cannot add more items. Only ${product.stock} in stock!`, 'error');
        return;
    }

    item.quantity = newQuantity;
    updateCartDisplay();
    updateCartCount();
}


function toggleCart() {
    const cartSection = document.getElementById('cart');
    const productsSection = document.getElementById('products');
    
    if (cartSection.classList.contains('hidden')) {
        cartSection.classList.remove('hidden');
        productsSection.classList.add('hidden');
    } else {
        cartSection.classList.add('hidden');
        productsSection.classList.remove('hidden');
    }
}


function updateCartDisplay() {
    const cartItems = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');
    const checkoutBtn = document.getElementById('checkout-btn');

    if (cart.length === 0) {
        cartItems.innerHTML = '<div class="empty-cart">Your cart is empty</div>';
        cartTotal.textContent = '0.00';
        checkoutBtn.disabled = true;
        return;
    }

    cartItems.innerHTML = '';
    let total = 0;

    cart.forEach(item => {
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        // Ensure we have a valid image URL
        const imageUrl = item.image && item.image.trim() !== '' ? 
            item.image : 
            'https://via.placeholder.com/80x80?text=No+Image';
        cartItem.innerHTML = `
            <img src="${imageUrl}" 
                 alt="${item.name}" 
                 onerror="this.onerror=null; this.src='https://via.placeholder.com/80x80?text=Image+Error'"
                 style="width: 80px; height: 80px; object-fit: cover; border-radius: 5px;">
            <div class="cart-item-info">
                <h4>${item.name}</h4>
                <p>$${item.price.toFixed(2)} each</p>
                <p class="item-subtotal">Subtotal: $${(item.price * item.quantity).toFixed(2)}</p>
            </div>
            <div class="cart-item-controls">
                <button class="quantity-btn" onclick="updateQuantity('${item._id}', -1)">-</button>
                <span class="quantity">${item.quantity}</span>
                <button class="quantity-btn" onclick="updateQuantity('${item._id}', 1)">+</button>
                <button class="remove-btn" onclick="removeFromCart('${item._id}')">Remove</button>
            </div>
        `;
        cartItems.appendChild(cartItem);
        total += item.price * item.quantity;
    });

    cartTotal.textContent = total.toFixed(2);
    checkoutBtn.disabled = false;
}


function updateCartCount() {
    const cartCount = document.getElementById('cart-count');
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
}


function showMessage(text, type) {
    const messageEl = document.getElementById('message');
    messageEl.textContent = text;
    messageEl.className = `message ${type}`;
    messageEl.classList.remove('hidden');

    setTimeout(() => {
        messageEl.classList.add('hidden');
    }, 3000);
}


async function checkout() {
    console.log('🛒 Checkout initiated');
    
    if (cart.length === 0) {
        showMessage('Your cart is empty!', 'error');
        return;
    }
    
    console.log('Cart contents:', cart);
    
    // Ensure Stripe is initialized
    if (!stripe) {
        console.error('❌ Stripe not initialized');
        showMessage('Payment system is not ready. Please try again.', 'error');
        return;
    }
    
    console.log('✅ Stripe is ready');

 
    const checkoutBtn = document.getElementById('checkout-btn');
    checkoutBtn.disabled = true;
    checkoutBtn.textContent = 'Processing...';

    try {
        
        const lineItems = cart.map(item => ({
            price_data: {
                currency: 'usd',
                product_data: {
                    name: item.name,
                    description: item.description,
                    // Remove images for now to avoid URL issues
                    // images: [item.image],
                },
                unit_amount: Math.round(item.price * 100), // Convert to cents
            },
            quantity: item.quantity
        }));

        // Store product IDs separately for the server
        const productMetadata = cart.map(item => ({
            productId: item._id,
            quantity: item.quantity
        }));

       
        console.log('📤 Sending checkout request:', {
            lineItems: lineItems.length,
            productMetadata: productMetadata.length
        });

        const response = await fetch('/create-checkout-session', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                line_items: lineItems,
                product_metadata: productMetadata,
                success_url: window.location.origin + '/success.html',
                cancel_url: window.location.origin + '/index.html',
            }),
        });

        console.log('📥 Response status:', response.status);

        if (!response.ok) {
            const errorData = await response.json();
            console.error('❌ Server error:', errorData);
            throw new Error(errorData.error || 'Failed to create checkout session');
        }

        const session = await response.json();
        console.log('✅ Session created:', { id: session.id, demo: session.demo });

        
        if (session.demo) {
            showMessage('Demo Mode: Simulating payment process...', 'success');
            
            
            setTimeout(async () => {
                try {
                   
                    const completeResponse = await fetch('/complete-demo-checkout', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            sessionId: session.id
                        }),
                    });

                    if (completeResponse.ok) {
                        
                        cart = [];
                        updateCartDisplay();
                        updateCartCount();
                       
                        window.location.href = `/success.html?session_id=${session.id}&demo=true`;
                    } else {
                        throw new Error('Demo checkout failed');
                    }
                } catch (error) {
                    console.error('Demo checkout error:', error);
                    showMessage('Demo checkout failed. Please try again.', 'error');
                }
            }, 2000); 
            return;
        }

       
        console.log('🔄 Redirecting to Stripe checkout...');
        const result = await stripe.redirectToCheckout({
            sessionId: session.id
        });

        if (result.error) {
            console.error('❌ Stripe redirect error:', result.error);
            throw new Error(result.error.message);
        }

    } catch (error) {
        console.error('Checkout error:', error);
        let errorMessage = error.message || 'Checkout failed. Please try again.';
        
        if (errorMessage.includes('Invalid API Key')) {
            errorMessage = 'Stripe not configured. Running in demo mode - add your Stripe keys to .env file for real payments.';
        }
        
        showMessage(errorMessage, 'error');
    } finally {
        
        checkoutBtn.disabled = false;
        checkoutBtn.textContent = 'Checkout with Stripe';
    }
}


function handleUrlParams() {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');
    const isDemo = urlParams.get('demo');
    
    if (sessionId) {
        
        cart = [];
        updateCartDisplay();
        updateCartCount();
        
        if (isDemo) {
            showMessage('Demo payment completed successfully! (No real money was charged)', 'success');
        } else {
            showMessage('Payment successful! Thank you for your purchase.', 'success');
        }
    }
}


document.addEventListener('DOMContentLoaded', handleUrlParams);