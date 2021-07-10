import * as Element from './element.js';
import * as Route from '../controller/route.js';
import * as FirebaseController from '../controller/firebase_controller.js';
import * as Constant from '../model/constant.js';
import * as Util from './util.js';
import * as Auth from '../controller/auth.js';
import {
    ShoppingCart
} from '../model/ShoppingCart.js';
import {
    dashboard_page
} from './admin/dashboard_page.js';

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
        productContainer.innerHTML += build(products[i], i);
    }



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
    <div class="card" style="width: 18rem; display: inline-block;">
        <img src="${product.imageURL}" class="card-img-top">
        <div class="card-body">
            <h5 class="card-title">${product.name}</h5>
            <p class="card-text">
                ${Util.currency(product.price)} <br>
                ${product.summary}
            </p>
            <div class="container pt-3 bg-light ${Auth.currentUser ? 'd-block' : 'd-none'}">  
                <form method="post" class="d-inline form-dec-qty">
                    <input type="hidden" name="index" value="${index}">
                    <button class="btn btn-outline-danger" type="submit">&minus;</button>
                </form>
                    <div id="qty-${product.docId}" class="container rounded text-center text-white bg-primary d-inline-block w-50">
                        ${product.qty ==null || product.qty == 0 ? 'Add': product.qty}
                    </div>
                <form method="post" class="d-inline form-inc-qty">
                    <input type="hidden" name="index" value="${index}">
                    <button class="btn btn-outline-primary" type="submit">&plus;</button>
                </form>
            </div>
        </div>
  </div>
    `;
}

function build(product, index) {
    return `
    <!-- card -->
            <div class="col-md-3">
                <div class="rounded rounded-lg shadow card border-light">
                    <img src="${product.imageURL}" alt="product" class="card-img-top img-fluid">
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
                            <a href="#" class="p-0 btn btn-sm btn-link text-primary extra__detail">details</a>
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

export function initShoppingCart() {
    const cartString = window.localStorage.getItem('cart-' + Auth.currentUser.uid);
    cart = ShoppingCart.parse(cartString);
    if (!cart || !cart.isValid() || cart.uid != Auth.currentUser.uid) {
        window.localStorage.removeItem('cart-' + Auth.currentUser.uid);
        cart = new ShoppingCart(Auth.currentUser.uid);
    }

    Element.shoppingCartCount.innerHTML = cart.getTotalQty();
}