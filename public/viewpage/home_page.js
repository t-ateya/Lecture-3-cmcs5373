import * as Element from './element.js';
import * as Route from '../controller/route.js';
import * as FirebaseController from '../controller/firebase_controller.js';
import * as ReviewsController from '../controller/reviews_controller.js';
import * as Constant from '../model/constant.js';
import * as Util from './util.js';
import * as Auth from '../controller/auth.js';
import * as ProductDetails from "./product_detail.js";
import {
    ShoppingCart
} from '../model/ShoppingCart.js';


export function addEventListeners() {
    Element.menuHome.addEventListener('click', async() => {
        history.pushState(null, null, Route.routePathnames.HOME);
        const label = Util.disableButton(Element.menuHome);
        await home_page();
        Util.enableButton(Element.menuHome, label);
    });
}

export let cart;

export async function home_page() {
    Util.toggleMenuLinks();
    let html = '<h1> Enjoy Shopping! </h1>';
    html += `<div class="row" id="product-container"></di>`;

    // initShoppingCart();

    let products;
    try {
        products = await FirebaseController.getProductList();

        // push products to local storage
        localStorage.setItem("products", JSON.stringify(products));

        if (cart) {
            cart.items.forEach(item => {
                const product = products.find(p => item.docId == p.docId);
                product.qty = item.qty;
            });
        }
    } catch (e) {
        if (Constant.DeV) console.log(e);
        Util.info('Cannot get product info', JSON.stringify(e));
    }

    Element.root.innerHTML = html;
    const productContainer = document.querySelector('#product-container');
    productContainer.innerHTML = '';
    for (let i = 0; i < products.length; i++) {
        await buildProductView(products[i], productContainer);
    }

    // handle effect when user click on product details
    handleProductDetailEvents(products);
}

async function buildProductView(product, container) {
    // set qty to 0 of this product
    product.qty = 0;
    const productCard = Element.templateProductCard.cloneNode(true).content;

    productCard.querySelector('.product__price').textContent = Util.currency(product.price);
    productCard.querySelector('.product__name').textContent = product.name;
    productCard.querySelector('.product-image').src = product.imageURL;
    productCard.querySelector('.extra__detail').dataset.productId = product.docId;
    productCard.querySelector('.counter__value').id = `qty-${product.docId}`;
    const counterForm = productCard.querySelector('.extra__counter');

    const minusProductForm = productCard.querySelector('.form-dec-qty');
    const addProductForm = productCard.querySelector('.form-inc-qty');

    minusProductForm.addEventListener('submit', e => {
        e.preventDefault();

        // subtract product qty
        product.qty -= 1;
        // e.target.index.value;
        //dec(remove) p to shoppingcart
        cart.removeItem(product);
        e.target.closest('.extra__counter').querySelector('.counter__value').textContent =
            (product.qty == null || product.qty == 0) ? 'Add' : product.qty;

        Element.shoppingCartCount.innerHTML = cart.getTotalQty();
    });

    addProductForm.addEventListener('submit', e => {
        e.preventDefault();
        // subtract product qty
        product.qty += 1;
        // e.target.index.value;
        //dec(remove) p to shoppingcart
        cart.addItem(product);
        e.target.closest('.extra__counter').querySelector('.counter__value').textContent =
            (product.qty == null || product.qty == 0) ? 'Add' : product.qty;

        Element.shoppingCartCount.innerHTML = cart.getTotalQty();
    });

    if (Auth.currentUser) {
        counterForm.classList.remove('d-none');
    } else {
        counterForm.classList.add('d-none');
    }

    if (product.discount > 0) {
        productCard
            .querySelector('.product__discount')
            .classList.remove('d-none');
        productCard
            .querySelector('.product__discount_text')
            .textContent = product.discount;
    } else {
        productCard
            .querySelector('.product__discount')
            .classList.add('d-none');
    }

    const reviewList = await ReviewsController.getReviewList();
    const averageStarRating = ReviewsController.getAverageRating(reviewList, product);
    const productReviewList = ReviewsController.getProductReviewList(reviewList, product);
    productCard.querySelector('.review__count').textContent = `${productReviewList.length} reviews`;
    // highlight average star rating
    // average__star__rating
    const stars = Array.from(document.querySelectorAll('.product__average__review .bxs-star'));
    stars.filter((_star, index) => index < averageStarRating)
        .map(star => star.classList.add('text-warning'));

    container.append(productCard);
    // productContainer.appendChild(cardContainer);
}

function handleProductDetailEvents(products) {
    const detailLinks = document.querySelectorAll(".extra__detail");
    detailLinks.forEach(link => link.addEventListener('click', e => {
        e.preventDefault();
        const productId = e.target.dataset.productId;
        const selectedProduct = products.find(p => p.docId === productId);
        localStorage.setItem('product', JSON.stringify(selectedProduct));
        // Route to product details page.
        history.pushState(null, productId, Route.routePathnames.PRODUCT_DETAIL);
        product_details();
    }));
}

export async function product_details() {
    Element.root.innerHTML = `loading...`;
    // get the product from local storage
    const productData = localStorage.getItem('product');
    const product = JSON.parse(productData);
    ProductDetails.showProductDetail(product);
}



export function initShoppingCart() {
    const cartString = window.localStorage.getItem('cart-' + Auth.currentUser.uid);
    cart = ShoppingCart.parse(cartString);
    if (!cart || !cart.isValid() || cart.uid != Auth.currentUser.uid) {
        window.localStorage.removeItem('cart-' + Auth.currentUser.uid);
        cart = new ShoppingCart(Auth.currentUser.uid);
    }

    Element.shoppingCartCount.innerHTML = cart.getTotalQty();
}