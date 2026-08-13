/* ==========================================================================
   ANTHIO DETOX DRINKS - INTERACTIVE FRONT-END LOGIC
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

    // Global App State
    const state = {
        boxSize: 30, // 20 or 30
        flavors: {
            immune: 6,
            energy: 6,
            calm: 6,
            detox: 6,
            antioxidant: 6
        },
        plan: 'subscribe', // 'one-time' or 'subscribe'
        cart: []
    };

    // Prices in COP
    const prices = {
        size20: {
            oneTime: 74900,
            subscribe: 64900
        },
        size30: {
            oneTime: 109900,
            subscribe: 89900
        }
    };

    // 1. Mobile Menu Toggle
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');

    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });
    }

    // Close mobile nav when clicking nav link
    document.querySelectorAll('.nav__link').forEach(link => {
        link.addEventListener('click', () => {
            if (navMenu) navMenu.classList.remove('active');
        });
    });

    // 2. Customizer Logic
    const sizeBtns = document.querySelectorAll('.size-btn');
    const targetCountSpan = document.getElementById('target-count');
    const allocatedCountSpan = document.getElementById('allocated-count');
    const progressBar = document.getElementById('progress-bar');
    const planRadios = document.querySelectorAll('input[name="custom-plan"]');
    const planCards = document.querySelectorAll('.plan-card');

    // Update Box Size Selection
    sizeBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            sizeBtns.forEach(b => b.classList.remove('active'));
            const targetBtn = e.currentTarget;
            targetBtn.classList.add('active');
            
            state.boxSize = parseInt(targetBtn.dataset.size, 10);
            rebalanceFlavors();
            updateCustomizerUI();
        });
    });

    // Rebalance initial flavor allocations when box size switches
    function rebalanceFlavors() {
        const perFlavor = Math.floor(state.boxSize / 5);
        state.flavors.immune = perFlavor;
        state.flavors.energy = perFlavor;
        state.flavors.calm = perFlavor;
        state.flavors.detox = perFlavor;
        state.flavors.antioxidant = perFlavor;
    }

    // Plus & Minus Buttons for Flavors
    document.querySelectorAll('.qty-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const flavor = e.currentTarget.dataset.flavor;
            const isPlus = e.currentTarget.classList.contains('plus');
            const totalAllocated = getTotalAllocated();

            if (isPlus && totalAllocated < state.boxSize) {
                state.flavors[flavor]++;
            } else if (!isPlus && state.flavors[flavor] > 0) {
                state.flavors[flavor]--;
            }

            updateCustomizerUI();
        });
    });

    // Plan Option Radio Changes
    planRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            state.plan = e.target.value;
            planCards.forEach(card => card.classList.remove('active'));
            e.target.closest('.plan-card').classList.add('active');
            updateCustomizerUI();
        });
    });

    function getTotalAllocated() {
        return Object.values(state.flavors).reduce((a, b) => a + b, 0);
    }

    function formatCOP(amount) {
        return 'COP $' + amount.toLocaleString('es-CO');
    }

    function updateCustomizerUI() {
        // Update Flavor Inputs Display
        Object.keys(state.flavors).forEach(f => {
            const qtySpan = document.getElementById(`qty-${f}`);
            if (qtySpan) qtySpan.textContent = state.flavors[f];
        });

        // Update Sachet Progress
        const total = getTotalAllocated();
        if (targetCountSpan) targetCountSpan.textContent = state.boxSize;
        if (allocatedCountSpan) allocatedCountSpan.textContent = total;
        
        if (progressBar) {
            const percentage = Math.min((total / state.boxSize) * 100, 100);
            progressBar.style.width = `${percentage}%`;
            progressBar.style.backgroundColor = total === state.boxSize ? '#6FAE45' : '#F4C542';
        }

        // Price Calculations
        const currentPrices = state.boxSize === 30 ? prices.size30 : prices.size20;
        const currentTotalPrice = state.plan === 'subscribe' ? currentPrices.subscribe : currentPrices.oneTime;

        // Displays
        const oneTimeDisp = document.getElementById('one-time-price-display');
        const subDisp = document.getElementById('subscribe-price-display');
        const summaryTotal = document.getElementById('summary-total-price');
        const summaryBoxName = document.getElementById('summary-box-name');
        const summaryBreakdown = document.getElementById('summary-breakdown');

        if (oneTimeDisp) oneTimeDisp.textContent = formatCOP(currentPrices.oneTime);
        if (subDisp) subDisp.textContent = formatCOP(currentPrices.subscribe) + '/mo';
        if (summaryTotal) summaryTotal.textContent = formatCOP(currentTotalPrice) + (state.plan === 'subscribe' ? '/mo' : '');
        if (summaryBoxName) summaryBoxName.textContent = `${state.boxSize}-Sachet Custom Box (${state.plan === 'subscribe' ? '6-Month Plan' : 'One-time'})`;

        // Breakdown render
        if (summaryBreakdown) {
            summaryBreakdown.innerHTML = `
                <div class="summary-item"><span>🟢 Immune:</span> <strong>${state.flavors.immune}</strong></div>
                <div class="summary-item"><span>🟡 Energy:</span> <strong>${state.flavors.energy}</strong></div>
                <div class="summary-item"><span>🔵 Calm:</span> <strong>${state.flavors.calm}</strong></div>
                <div class="summary-item"><span>🟢 Detox:</span> <strong>${state.flavors.detox}</strong></div>
                <div class="summary-item"><span>🟣 Antioxidant:</span> <strong>${state.flavors.antioxidant}</strong></div>
            `;
        }
    }

    // Initial Customizer Render
    updateCustomizerUI();

    // 3. Cart & Modal Management
    const cartBtn = document.getElementById('cart-btn');
    const cartModal = document.getElementById('cart-modal');
    const cartOverlay = document.getElementById('cart-overlay');
    const cartClose = document.getElementById('cart-close');
    const cartCountBadge = document.getElementById('cart-count');
    const cartItemsContainer = document.getElementById('cart-items');
    const cartSubtotalSpan = document.getElementById('cart-subtotal');
    const checkoutBtn = document.getElementById('checkout-btn');

    function toggleCart() {
        if (cartModal) cartModal.classList.toggle('active');
    }

    if (cartBtn) cartBtn.addEventListener('click', toggleCart);
    if (cartOverlay) cartOverlay.addEventListener('click', toggleCart);
    if (cartClose) cartClose.addEventListener('click', toggleCart);

    // Add Custom Box to Cart
    const addCustomBtn = document.getElementById('add-custom-box-btn');
    if (addCustomBtn) {
        addCustomBtn.addEventListener('click', () => {
            const total = getTotalAllocated();
            if (total !== state.boxSize) {
                // Front-end notification state inside summary
                alert(`Please allocate exactly ${state.boxSize} sachets before adding to cart.`);
                return;
            }

            const currentPrices = state.boxSize === 30 ? prices.size30 : prices.size20;
            const itemPrice = state.plan === 'subscribe' ? currentPrices.subscribe : currentPrices.oneTime;

            const cartItem = {
                id: Date.now(),
                title: `${state.boxSize}-Sachet Custom Box`,
                subtitle: state.plan === 'subscribe' ? '6-Month Subscription' : 'One-time purchase',
                price: itemPrice
            };

            state.cart.push(cartItem);
            updateCartUI();
            toggleCart();
        });
    }

    // Add Preset Boxes to Cart
    document.querySelectorAll('.add-preset-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const name = e.currentTarget.dataset.name;
            const price = parseInt(e.currentTarget.dataset.price, 10);

            state.cart.push({
                id: Date.now(),
                title: name,
                subtitle: 'Standard Curated Mix',
                price: price
            });

            updateCartUI();
            toggleCart();
        });
    });

    function updateCartUI() {
        if (cartCountBadge) cartCountBadge.textContent = state.cart.length;

        if (!cartItemsContainer) return;

        if (state.cart.length === 0) {
            cartItemsContainer.innerHTML = '<p class="empty-cart-msg">Your cart is currently empty.</p>';
            if (cartSubtotalSpan) cartSubtotalSpan.textContent = 'COP $0';
            if (checkoutBtn) checkoutBtn.disabled = true;
            return;
        }

        let total = 0;
        cartItemsContainer.innerHTML = state.cart.map(item => {
            total += item.price;
            return `
                <div class="cart-item">
                    <div>
                        <div class="cart-item__title">${item.title}</div>
                        <div class="cart-item__sub">${item.subtitle}</div>
                    </div>
                    <strong>${formatCOP(item.price)}</strong>
                </div>
            `;
        }).join('');

        if (cartSubtotalSpan) cartSubtotalSpan.textContent = formatCOP(total);
        if (checkoutBtn) checkoutBtn.disabled = false;
    }

    // Checkout Prototype Action
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            cartItemsContainer.innerHTML = `
                <div style="text-align:center; padding: 20px 0;">
                    <div style="font-size: 2.5rem; margin-bottom: 10px;">🎉</div>
                    <h4>Checkout Prototype Successful!</h4>
                    <p style="font-size: 0.85rem; color: var(--color-text-muted); margin-top: 8px;">
                        In a live production deployment, this redirects to Webpay, Wompi, or Stripe integration.
                    </p>
                </div>
            `;
            state.cart = [];
            if (cartCountBadge) cartCountBadge.textContent = '0';
            if (cartSubtotalSpan) cartSubtotalSpan.textContent = 'COP $0';
            checkoutBtn.disabled = true;
        });
    }

    // 4. FAQ Accordion Logic
    document.querySelectorAll('.accordion__header').forEach(header => {
        header.addEventListener('click', () => {
            const item = header.parentElement;
            const isActive = item.classList.contains('active');

            document.querySelectorAll('.accordion__item').forEach(i => i.classList.remove('active'));

            if (!isActive) {
                item.classList.add('active');
            }
        });
    });

    // 5. Contact Modal Logic
    const contactLink = document.getElementById('contact-link');
    const contactModal = document.getElementById('contact-modal');
    const modalOverlay = document.getElementById('modal-overlay');
    const modalClose = document.getElementById('modal-close');
    const contactForm = document.getElementById('contact-form');
    const formFeedback = document.getElementById('form-feedback');

    function toggleContactModal(e) {
        if (e) e.preventDefault();
        if (contactModal) contactModal.classList.toggle('active');
    }

    if (contactLink) contactLink.addEventListener('click', toggleContactModal);
    if (modalOverlay) modalOverlay.addEventListener('click', toggleContactModal);
    if (modalClose) modalClose.addEventListener('click', toggleContactModal);

    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            if (formFeedback) {
                formFeedback.textContent = "Thank you! Your message has been sent (Front-end prototype).";
            }
            setTimeout(() => {
                contactForm.reset();
                if (formFeedback) formFeedback.textContent = "";
                toggleContactModal();
            }, 2000);
        });
    }
});