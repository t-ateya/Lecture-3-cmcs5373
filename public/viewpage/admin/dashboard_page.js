import * as Element from "../element.js";
import * as Util from "../util.js";
import * as Route from "../../controller/route.js";
import * as FirebaseController from '../../controller/firebase_controller.js';
import {
    users_page
} from "./users_page.js";
import {
    products_page
} from "./products_page.js";

export function dashboard_page() {

    // show dashboard nav
    showDashboardNav();
    // Element.root.classList.add("container", "bg-white", "mx-auto");
    Element.root.innerHTML = `<h4 class="mb-4 text-dark">Hello <span class="text-primary font-weight-bold">Ateya,</span> welcome back!<h4>`;

    showStats();

    // handle event listeners
    dashboardEventListeners();
}

function showDashboardNav() {
    // empty the inner page com
    Element.userNavbar.classList.add('d-none');
    Element.adminNavbar.classList.remove('d-none');
}

function showUserNav() {
    // empty the inner page com
    Element.userNavbar.classList.remove('d-none');
    Element.adminNavbar.classList.add('d-none');
}

function showStats() {
    // clone stats template
    const statsTemplate = document.querySelector('#admin-stats');
    const statsContent = statsTemplate.cloneNode(true);
    // @ts-ignore
    Element.root.appendChild(statsContent.content);
}

function dashboardEventListeners() {
    handleSignOut();
    handleDashboard();
    handleUsers();
    handleProducts();
    handleVisitSite();
}

function handleVisitSite() {
    Element.adminVisitSite.addEventListener('click', async e => {
        e.preventDefault();
        Util.setActiveNav(e.target);
        history.pushState(null, null, Route.routePathnames.HOME);
        showUserNav();
    });
}

function handleSignOut() {
    Element.adminSignOut.addEventListener('click', async e => {
        e.preventDefault();
        Util.setActiveNav(e.target);
        await FirebaseController.signOut();
        showUserNav();
    });
}

function handleUsers() {
    Element.adminUsers.addEventListener('click', async e => {
        e.preventDefault();
        Util.setActiveNav(e.target);
        history.pushState(null, null, Route.routePathnames.USERS);
        await users_page();
    });
}

function handleDashboard() {
    Element.adminDashboard.addEventListener('click', e => {
        e.preventDefault();
        Util.setActiveNav(e.target);
        history.pushState(null, null, Route.routePathnames.DASHBOARD);
        dashboard_page();
    });
}

function handleProducts() {
    Element.adminProducts.addEventListener('click', e => {
        e.preventDefault();
        Util.setActiveNav(e.target);
        history.pushState(null, null, Route.routePathnames.PRODUCTS);
        products_page();
    });
}