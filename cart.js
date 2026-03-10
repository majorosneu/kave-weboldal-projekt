class CustomCart {
    constructor() {
        this.cart = new Map(JSON.parse(localStorage.getItem('kavepont-cart')) || []);
        this.shippingFee = 990;
        this.initModal();
        this.bindEvents();
        this.renderCart();
    }

    initModal() {
        if (!document.getElementById('cartModal')) {
            const modalHTML = `
            <div class="modal fade" id="cartModal" tabindex="-1" aria-labelledby="cartModalLabel" aria-hidden="true">
                <div class="modal-dialog modal-dialog-scrollable modal-lg modal-dialog-centered">
                    <div class="modal-content shop-cart-modal">
                        <div class="modal-header border-0 pb-0">
                            <h2 class="h4 mb-0" id="cartModalLabel">Kosár</h2>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Bezárás"></button>
                        </div>
                        <div class="modal-body pt-3">
                            <p class="cart-helper mb-3">A szállítási díj fixen 990 Ft</p>
                            <ul id="cart-list" class="list-unstyled mb-3 cart-list">
                                <li id="cart-empty" class="cart-empty">A kosár jelenleg üres.</li>
                            </ul>
                            <div class="cart-summary mb-4">
                                <div class="d-flex justify-content-between mb-2">
                                    <span>Részösszeg</span>
                                    <strong id="cart-subtotal">0 Ft</strong>
                                </div>
                                <div class="d-flex justify-content-between mb-2">
                                    <span>Szállítás</span>
                                    <strong id="cart-shipping">0 Ft</strong>
                                </div>
                                <div class="d-flex justify-content-between total-row">
                                    <span>Végösszeg</span>
                                    <strong id="cart-total">0 Ft</strong>
                                </div>
                            </div>
                            <h3 class="h5 mb-3">Pénztár</h3>
                            <form id="checkout-form" class="checkout-form">
                                <div class="mb-3">
                                    <label for="checkout-name" class="form-label">Név</label>
                                    <input id="checkout-name" type="text" class="form-control clean-input" placeholder="Teljes név" required>
                                </div>
                                <div class="mb-3">
                                    <label for="checkout-address" class="form-label">Szállítási cím</label>
                                    <input id="checkout-address" type="text" class="form-control clean-input" placeholder="Irányítószám, város, utca" required>
                                </div>
                                <div class="mb-3">
                                    <label for="checkout-note" class="form-label">Megjegyzés</label>
                                    <textarea id="checkout-note" rows="3" class="form-control clean-input" placeholder="Kapucsengő, szállítási infó..."></textarea>
                                </div>
                                <button id="checkout-button" type="submit" class="btn btn-coffee w-100">Rendelés leadása</button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>`;
            document.body.insertAdjacentHTML('beforeend', modalHTML);
        }

        this.cartCountEls = document.querySelectorAll('.cart-count');
        this.cartListEl = document.getElementById('cart-list');
        this.cartSubtotalEl = document.getElementById('cart-subtotal');
        this.cartShippingEl = document.getElementById('cart-shipping');
        this.cartTotalEl = document.getElementById('cart-total');
        this.checkoutForm = document.getElementById('checkout-form');
    }

    bindEvents() {
        document.querySelectorAll('.add-to-cart').forEach(button => {
            button.addEventListener('click', () => {
                const id = button.dataset.productId;
                const name = button.dataset.productName;
                const price = Number(button.dataset.productPrice);
                const qtyInput = document.getElementById(button.dataset.qtyInput);
                const qty = Math.max(1, Number(qtyInput.value) || 1);

                // Optional: add a tiny animation or feedback here.
                button.innerHTML = 'Kosárban <svg width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-check-lg" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.4-6.425a.247.247 0 0 1 .02-.022Z"/></svg>';
                setTimeout(() => button.innerHTML = 'Kosárba', 1500);

                qtyInput.value = qty;
                this.addToCart(id, name, price, qty);
            });
        });

        this.cartListEl.addEventListener('click', (event) => {
            const removeButton = event.target.closest('[data-remove-id]');
            if (!removeButton) return;
            const itemId = removeButton.dataset.removeId;
            const li = removeButton.closest('.cart-item');
            li.style.animation = 'fadeOut 0.3s forwards';
            setTimeout(() => {
                this.cart.delete(itemId);
                this.saveCart();
            }, 300);
        });

        this.checkoutForm.addEventListener('submit', (event) => {
            event.preventDefault();
            if (this.cart.size === 0) {
                this.showToast("A kosarad üres!", true);
                return;
            }
            this.showSuccessModal();
            this.cart.clear();
            this.saveCart();
            const modal = bootstrap.Modal.getInstance(document.getElementById('cartModal'));
            if (modal) modal.hide();
        });
    }

    showToast(message, isError = false) {
        let existing = document.getElementById('cart-toast');
        if (existing) existing.remove();

        const bg = isError ? "bg-danger" : "bg-dark";
        const icon = isError ?
            `<svg width="18" height="18" class="bi bi-exclamation-circle-fill" viewBox="0 0 16 16" fill="currentColor"><path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM8 4a.905.905 0 0 0-.9.995l.35 3.507a.552.552 0 0 0 1.1 0l.35-3.507A.905.905 0 0 0 8 4zm.002 6a1 1 0 1 0 0 2 1 1 0 0 0 0-2z"/></svg>` :
            `<svg width="18" height="18" class="bi bi-info-circle-fill" viewBox="0 0 16 16" fill="currentColor"><path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm.93-9.412-1 4.705c-.07.34.029.533.304.533.194 0 .487-.07.686-.246l-.088.416c-.287.346-.92.598-1.465.598-.703 0-1.002-.422-.808-1.319l.738-3.468c.064-.293.006-.399-.287-.47l-.451-.081.082-.381 2.29-.287zM8 5.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2z"/></svg>`;

        const toastHTML = `
            <div id="cart-toast" class="toast align-items-center text-white ${bg} border-0 position-fixed" role="alert" aria-live="assertive" aria-atomic="true" style="bottom: 80px; left: 50%; transform: translateX(-50%); z-index: 2000; box-shadow: 0 10px 30px rgba(0,0,0,0.2); border-radius: 99px; padding: 0.1rem 0.5rem; font-weight: 600;">
                <div class="d-flex p-1 align-items-center">
                    <div class="toast-body d-flex align-items-center gap-2" style="font-size: 0.9rem; padding: 0.5rem 0.75rem;">
                        ${icon}
                        <span>${message}</span>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', toastHTML);
        const toastEl = document.getElementById('cart-toast');
        const toast = new bootstrap.Toast(toastEl, { delay: 3000 });
        toast.show();
    }

    showSuccessModal() {
        let existing = document.getElementById('successModal');
        if (existing) existing.remove();

        const successHTML = `
            <div class="modal fade" id="successModal" tabindex="-1" aria-hidden="true">
                <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content text-center py-5 px-3" style="border-radius: 1.5rem; border: none; box-shadow: 0 24px 48px rgba(42, 34, 31, 0.2);">
                        <div class="modal-body">
                            <div class="mb-4 d-flex justify-content-center">
                                <svg class="animated-check" viewBox="0 0 24 24">
                                    <path class="animated-check-path" fill="none" d="M4.1 12.7L9 17.6 20.3 6.3"/>
                                </svg>
                            </div>
                            <h3 class="h4 mb-3" style="color: var(--coffee-900); font-weight: 800;">Rendelés sikeresen leadva!</h3>
                            <p class="text-muted mb-4" style="font-size: 1.05rem;">Köszönjük a rendelést! Hamarosan küldjük a visszaigazolást az e-mail címedre.</p>
                            <button type="button" class="btn btn-coffee px-4" data-bs-dismiss="modal">Rendben, köszönöm</button>
                        </div>
                    </div>
                </div>
            </div>
            <style>
                .animated-check {
                    width: 80px;
                    height: 80px;
                    border-radius: 50%;
                    display: block;
                    stroke-width: 2;
                    stroke: #fff;
                    stroke-miterlimit: 10;
                    box-shadow: inset 0px 0px 0px #198754;
                    animation: fillAnimation .4s ease-in-out .4s forwards, scaleAnimation .3s ease-in-out .9s both;
                }

                .animated-check-path {
                    transform-origin: 50% 50%;
                    stroke-dasharray: 48;
                    stroke-dashoffset: 48;
                    animation: strokeAnimation 0.4s cubic-bezier(0.65, 0, 0.45, 1) 0.6s forwards;
                }

                @keyframes strokeAnimation {
                    100% { stroke-dashoffset: 0; }
                }

                @keyframes scaleAnimation {
                    0%, 100% { transform: none; }
                    50% { transform: scale3d(1.15, 1.15, 1); }
                }

                @keyframes fillAnimation {
                    100% { box-shadow: inset 0px 0px 0px 42px #198754; }
                }
            </style>
        `;
        document.body.insertAdjacentHTML('beforeend', successHTML);
        const modal = new bootstrap.Modal(document.getElementById('successModal'));
        modal.show();
    }

    formatHuf(value) {
        return `${value.toLocaleString('hu-HU')} Ft`;
    }

    addToCart(id, name, price, qty) {
        const existing = this.cart.get(id);
        if (existing) {
            existing.qty += qty;
        } else {
            this.cart.set(id, { id, name, price, qty });
        }
        this.saveCart();
    }

    saveCart() {
        localStorage.setItem('kavepont-cart', JSON.stringify(Array.from(this.cart.entries())));
        this.renderCart();
    }

    renderCart() {
        const items = Array.from(this.cart.values());
        const itemCount = items.reduce((sum, item) => sum + item.qty, 0);
        const subtotal = items.reduce((sum, item) => sum + item.qty * item.price, 0);
        const shipping = subtotal > 0 ? this.shippingFee : 0;
        const total = subtotal + shipping;

        this.cartCountEls.forEach(el => el.textContent = `${itemCount} tétel`);
        this.cartSubtotalEl.textContent = this.formatHuf(subtotal);
        this.cartShippingEl.textContent = this.formatHuf(shipping);
        this.cartTotalEl.textContent = this.formatHuf(total);

        this.cartListEl.innerHTML = '';
        if (items.length === 0) {
            this.cartListEl.innerHTML = '<li id="cart-empty" class="cart-empty text-center py-3">A kosár jelenleg üres.</li>';
            return;
        }

        items.forEach((item) => {
            const lineTotal = item.qty * item.price;
            const li = document.createElement('li');
            li.className = 'cart-item';
            li.innerHTML = `
                <div>
                    <span class="text-dark">${item.name} x${item.qty}</span>
                    <strong class="d-block text-coffee mt-1">${this.formatHuf(lineTotal)}</strong>
                </div>
                <button type="button" class="btn btn-sm btn-remove" data-remove-id="${item.id}">Eltávolítás</button>
            `;
            this.cartListEl.appendChild(li);
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.AppCart = new CustomCart();
});
