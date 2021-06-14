import * as Route from './controller/route.js'

window.onload = () => {
    const pathname = window.location.pathname;
    const hash = window.location.hash;

    Route.routing(pathname, hash);
}