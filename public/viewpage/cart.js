import * as Element from './element.js'
import * as Route from '../controller/route.js'
import * as Auth from '../controller/auth.js'
import * as Home from './home_page.js'
import * as Util from './util.js'


export function addEventListeners(){
    Element.menuCart.addEventListener('click', async()=>{
        history.pushState(null, null, Route.routePathnames.CART);
        await cart_page();
    });
}

export async function cart_page(){
    if (!Auth.currentUser){
        Element.root.innerHTML = '<h1> Protected Page </h1>'
        return ;
    }
    let html = '<h1> Shopping Cart </h1>'

    const cart = Home.cart;
    if (!cart || cart.getTotalQty() == 0){
        html += '<h1> Empty! Buy More! </h1>';
        Element.root.innerHTML = html;
        return;
    }

    html += `
    <table class="table table-striped">
  <thead>
    <tr>
      <th scope="col">Image</th>
      <th scope="col">Name</th>
      <th scope="col">Unit Price</th>
      <th scope="col">Quantity</th>
      <th scope="col">Sub-Total</th>
      <th scope="col" width="50%">Summary</th>
    </tr>
  </thead>
  <tbody>
    `;

    cart.items.forEach(item => {
        html += `
        <tr>
            <td><img src="${item.imageURL}" width="150px"></td>
            <td> ${item.name}</td>
            <td> ${Util.currency(item.price)}</td>
            <td> ${item.qty}</td>
            <td> ${Util.currency(item.qty * item.price)}</td>
            <td> ${item.summary}</td>
        </tr>
        `;
    });
    html += '</tbody></table>'
    html += `
        <div style="font-size: 150%";>Total: ${Util.currency(cart.getTotalPrice())}</div>
    `
    html += `
        <button id="button-checkout" class="btn btn-outline-primary">Check Out</button>
        <button id="button-continue-shopping" class="btn btn-outline-secondary"> Continue Shopping </button>
    `

    Element.root.innerHTML = html;

    const continueButton = document.getElementById('button-continue-shopping');
    continueButton.addEventListener('click', async () =>{
        //handle navigation history i.e we navigate to home page to continue shopping
        history.pushState(null, null, Route.routePathnames.HOME); //handle navigation history i.e move to home page on the nav bar
        await Home.home_page(); //We then move to the home page

    });

    const checkoutButton = document.getElementById('button-checkout');
    checkoutButton.addEventListener('click',   async ()=>{

        //save cart info as purchase history to Firestore-will be done later

        Util.info('Success', 'Checkout Completed!')

        window.localStorage.removeItem(`cart-${Auth.currentUser.uid}`);
        cart.empty();
        Element.shoppingCartCount.innerHTML = '0'; //set shopping cart count to 0
        history.pushState(null, null, Route.routePathnames.HOME);
        Home.home_page();
    });
}