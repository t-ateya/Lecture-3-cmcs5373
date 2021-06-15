import * as Route from './controller/routes.js'
import * as Auth from './controller/auth.js'
import * as ProductPage from './viewpage/product_page.js'

window.onload = () => {
    const pathname = window.location.pathname;
    const hash = window.location.hash;

    Route.routing(pathname, hash);

    
}

Auth.addEventListeners();
ProductPage.addEventListeners();