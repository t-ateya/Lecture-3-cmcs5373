import * as Home from '../viewpage/home_page.js'
import * as Purchase from '../viewpage/purchase_page.js'
import * as Cart from '../viewpage/cart.js'
import * as Profile from '../viewpage/profile_page.js'

//Let's define route path object
export  const routePathnames ={
    HOME: '/', 
    PURCHASE: '/purchase',
    PROFILE: '/profile',
    CART: '/cart',

}

//let's define a mapping b/n pathname and the corresponding function
export const routes =[
    {pathname: routePathnames.HOME, page: Home.home_page},
    {pathname: routePathnames.PURCHASE, page: Purchase.purchase_page},
    {pathname: routePathnames.PROFILE, page: Profile.profile_page},
    {pathname: routePathnames.CART, page: Cart.cart_page},
];

export function routing(pathname, hash){
    const route = routes.find(r=>r.pathname == pathname);
    if(route)route.page();
    else routes[0].page();//home page as default
}

