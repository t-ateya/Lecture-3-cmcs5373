import * as Auth from "./controller/auth.js";
import * as Home from "./viewpage/home_page.js";
import * as Purchase from "./viewpage/purchase_page.js";
import * as Cart from "./viewpage/cart.js";
import * as Profile from "./viewpage/profile_page.js";
import * as Route from "./controller/route.js";
import * as ProductPage from './viewpage/product_page.js';
import * as User from './viewpage/user_page.js';
import * as Edit from './controller/edit_product.js';

//attach a function to be called when a web browser loads a page
window.onload = () => {
    const pathname = window.location.pathname;
    const hash = window.location.hash;
    Route.routing(pathname, hash);
};

// document.addEventListener('load', e => {
//   const pathname = window.location.pathname;
//   const hash = window.location.hash;
//   Route.routing(pathname, hash);
// })

//Let's add event listener when back or forth button is clicked-navigation history

window.addEventListener('popstate', e => {
    e.preventDefault();
    const pathname = e.target.location.pathname;
    const hash = e.target.location.hash;
    Route.routing(pathname, hash);
})

Auth.addEventListeners();
ProductPage.addEventListeners();
Home.addEventListeners();
User.addEventListeners();
Edit.addEventListeners();
Purchase.addEventListeners();
Cart.addEventListeners();
Profile.addEventListeners();