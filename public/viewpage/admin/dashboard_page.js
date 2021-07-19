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
    const label = Util.disableButton(Element.adminDashboard);
    // show dashboard nav
    showDashboardNav();

    // self-invocking function
    (async() => {
        Element.root.innerHTML = await showStats();
    })();

    Util.enableButton(Element.adminDashboard, label);

    // handle event listeners
    removeDashboardListeners();
    dashboardEventListeners();
}

function removeDashboardListeners() {
    Element.adminDashboard.removeEventListener('click', () => null);
    Element.adminProducts.removeEventListener('click', () => null);
    Element.adminUsers.removeEventListener('click', () => null);
    Element.adminVisitSite.removeEventListener('click', () => null);
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

async function showStats() {
    const {
        totalProducts,
        totalReviews,
        totalStock,
        totalUsers
    } = await FirebaseController.getDashboardStats();

    return `
    <div class="pb-4">
    <h3><strong>Hello,</strong> welcome back</h3>
</div>
<hr class="bg-secondary">

<div class="mt-5 row">
    <div class="col-6">
        <h4><strong class="text-primary">Stats summary</strong>, for your fireshop</h4>
        <p class="text-secondary">Make better decisions by the data you get<br />from your application.</p>
    </div>
    <div class="col-6">
        <div class="row">
            <div class="col-12">
                <div class="mb-4 border rounded shadow card border-light">
                    <div class="card-body d-flex align-items-center justify-content-between">
                        <p class="mb-0 text-secondary"><strong>Total<br />products</strong></p>
                        <span class="text-white bg-success font-weight-bold summary__value total__product">${totalProducts}</span>
                    </div>
                </div>
            </div>
            <div class="col-6 d-none">
                <div class="mb-4 border rounded shadow card border-light">
                    <div class="card-body d-flex align-items-center justify-content-between">
                        <p class="mb-0 text-secondary"><strong>Total available<br />stock</strong></p>
                        <span class="text-white bg-primary font-weight-bold summary__value total__stock">${totalStock}</span>
                    </div>
                </div>
            </div>
            <div class="col-6">
                <div class="mb-4 border rounded shadow card border-light">
                    <div class="card-body d-flex align-items-center justify-content-between">
                        <p class="mb-0 text-secondary"><strong>Total app<br />users</strong></p>
                        <span class="text-white bg-danger font-weight-bold summary__value total__users">${totalUsers}</span>
                    </div>
                </div>
            </div>
            <div class="col-6">
                <div class="mb-4 border rounded shadow card border-light">
                    <div class="card-body d-flex align-items-center justify-content-between">
                        <p class="mb-0 text-secondary"><strong>Total product<br />reviews</strong></p>
                        <span class="text-dark bg-warning font-weight-bold summary__value total__reviews">${totalReviews}</span>
                    </div>
                </div>
            </div>
        </div>
    </div>`;
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
        const label = Util.disableButton(e.target);
        history.pushState(null, null, Route.routePathnames.HOME);
        showUserNav();
        Util.enableButton(e.target, label);
    });
}

function handleSignOut() {
    Element.adminSignOut.addEventListener('click', async e => {
        e.preventDefault();
        Util.setActiveNav(e.target);
        const label = Util.disableButton(e.target);
        await FirebaseController.signOut();
        showUserNav();
        Util.enableButton(e.target, label);
    });
}

function handleUsers() {
    Element.adminUsers.addEventListener('click', async e => {
        e.preventDefault();
        Util.setActiveNav(e.target);
        const label = Util.disableButton(e.target);
        history.pushState(null, null, Route.routePathnames.USERS);
        await users_page();
        Util.enableButton(e.target, label);
    });
}

function handleDashboard() {
    Element.adminDashboard.addEventListener('click', e => {
        e.preventDefault();
        Util.setActiveNav(e.target);
        const label = Util.disableButton(e.target);
        history.pushState(null, null, Route.routePathnames.DASHBOARD);
        dashboard_page();
        Util.enableButton(e.target, label);
    });
}

function handleProducts() {
    Element.adminProducts.addEventListener('click', async e => {
        e.preventDefault();
        Util.setActiveNav(e.target);
        const label = Util.disableButton(e.target);
        history.pushState(null, null, Route.routePathnames.PRODUCTS);
        await products_page();
        Util.enableButton(e.target, label);
    });
}