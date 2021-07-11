import * as Element from './element.js';
import * as Route from '../controller/route.js';
import * as FirebaseController from '../controller/firebase_controller.js';
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
    for (let i = 0; i < products.length; i++) {
        productContainer.innerHTML += buildProductView(products[i], i);
    }

    // handle effect when user click on product details
    handleProductDetailEvents(products);

    const decForms = document.getElementsByClassName('form-dec-qty');
    for (let i = 0; i < decForms.length; i++) {
        decForms[i].addEventListener('submit', e => {
            e.preventDefault();
            const p = products[e.target.index.value];
            //dec(remove) p to shoppingcart
            cart.removeItem(p);
            document.getElementById('qty-' + p.docId).innerHTML =
                (p.qty == null || p.qty == 0) ? 'Add' : p.qty;
            Element.shoppingCartCount.innerHTML = cart.getTotalQty();

        });
    }

    const incForms = document.getElementsByClassName('form-inc-qty');
    for (let i = 0; i < incForms.length; i++) {
        incForms[i].addEventListener('submit', e => {
            e.preventDefault();
            const p = products[e.target.index.value];
            //add p to shoppingcart
            cart.addItem(p);
            document.getElementById('qty-' + p.docId).innerHTML = p.qty;
            Element.shoppingCartCount.innerHTML = cart.getTotalQty();

        });
    }
}

function buildProductView(product, index) {
    return `
        <!-- card -->
            <div class="col-12 col-md-6 col-lg-3">
                <div class="rounded rounded-lg shadow card border-light mb-4">
                    <img src="${product.imageURL}" alt="product" class="card-img-top img-fluid product-image">
                    <div class="card-body">
                        <h4 class="mb-2 text-danger">${Util.currency(product.price)}</h4>
                        <p class="mt-0 text-secondary">${product.name}</p>
                        <div class="mb-2 d-flex justify-content-between align-items-start">
                            <span class="badge bg-success">${product.discount}% discount</span>
                            <div class="review">
                                <div class="review__stars text-warning">
                                    <i class="bx bxs-star"></i>
                                    <i class="bx bxs-star"></i>
                                    <i class="bx bxs-star"></i>
                                    <i class="bx bxs-star"></i>
                                    <i class="bx bxs-star"></i>
                                </div>
                                <p class="mt-0 review__count text-secondary small">10 reviews</p>
                            </div>
                        </div>

                        <div class="text-secondary d-flex justify-content-between align-items-center">
                            <a href="#" class="p-0 btn btn-sm btn-link text-primary extra__detail" data-product-id="${product.docId}">details</a>
                            <div class="extra__counter counter d-flex align-items-center ${Auth.currentUser ? 'd-block' : 'd-none'}">
                                <form method="post" class="form-inline form-dec-qty">
                                    <input type="hidden" name="index" value="${index}">
                                    <button class="text-center counter__plus" type="submit">
                                        <i class="m-0 bx bx-minus d-inline-block"></i>
                                    </button>
                                </form>

                                <span id="qty-${product.docId}" class="px-2 mr-2 text-center counter__value">
                                    ${product.qty ==null || product.qty == 0 ? 'Add': product.qty}
                                </span>

                                <form method="post" class="d-inline form-inc-qty">
                                    <input type="hidden" name="index" value="${index}">
                                    <button class="text-center counter__minus d-inline-block" type="submit">
                                        <i class="m-0 bx bx-plus d-inline-block"></i>
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        <!-- card end-->
    `;
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

export function product_details() {
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