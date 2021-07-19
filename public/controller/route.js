import * as Home from '../viewpage/home_page.js';
import * as Purchase from '../viewpage/purchase_page.js';
import * as Cart from '../viewpage/cart.js';
import * as Profile from '../viewpage/profile_page.js';
import * as Admin from '../viewpage/admin/signin.js';

//Let's define route path object
export const routePathnames = {
    HOME: '/',
    PURCHASE: '/purchase',
    PROFILE: '/profile',
    CART: '/cart',
    ADMIN_LOGIN: '/admin/login',
    USERS: '/admin/users',
    DASHBOARD: '/admin/dashboard',
    PRODUCTS: '/admin/products',
    PRODUCT_DETAIL: '/products/'
};

//let's define a mapping b/n pathname and the corresponding function
export const routes = [{
        pathname: routePathnames.HOME,
        page: Home.home_page
    },
    {
        pathname: routePathnames.PRODUCT_DETAIL,
        page: Home.product_details
    },
    {
        pathname: routePathnames.PURCHASE,
        page: Purchase.purchase_page
    },
    {
        pathname: routePathnames.PROFILE,
        page: Profile.profile_page
    },
    {
        pathname: routePathnames.CART,
        page: Cart.cart_page
    },
    /* admin routes */
    {
        pathname: routePathnames.ADMIN_LOGIN,
        page: Admin.signIn
    },
];

export function routing(pathname, hash) {
    const route = routes.find(r => r.pathname == pathname);
    if (route) route.page();
    else routes[0].page(); // home page as default
}