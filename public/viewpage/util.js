import * as Route from '../controller/route.js';
import {
    currentUser,
    isAdmin
} from '../controller/auth.js';
import {
    dashboard_page
} from './admin/dashboard_page.js';
import * as Element from './element.js';

export function info(title, body, closeModal) {
    if (closeModal) closeModal.hide();
    Element.modalInfoTitle.innerHTML = title;
    Element.modalInfoBody.innerHTML = body;
    Element.modalInfo.show();
}

export function currency(money) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(money);
}

export function disableButton(button) {
    button.disabled = true;
    const label = button.innerHTML;
    button.innerHTML = 'Wait...';
    return label;
}

export function get(className) {
    return document.querySelector(className);
}

export function enableButton(button, label) {
    if (label) button.innerHTML = label;
    button.disabled = false;
}

export function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export function setActiveNav(navLink) {
    const currentActiveNav = document.querySelector('.nav-link-active');
    currentActiveNav.classList.remove('nav-link-active');
    navLink.classList.add('nav-link-active');
}

// toggle navigation links 
export function toggleMenuLinks() {
    const privateLinks = Array.from(document.querySelectorAll('.private-link'));
    const guestLinks = Array.from(document.querySelectorAll('.guest-link'));
    const adminLinks = Array.from(document.querySelectorAll('.admin-only'));

    if (currentUser) {
        // show private links
        privateLinks.forEach(link => link.classList.remove('d-none'));

        // hide guest only links
        guestLinks.forEach(link => link.classList.add('d-none'));

        if (isAdmin(currentUser.email)) {
            // show the dashboard link
            adminLinks.forEach(link => link.classList.remove('d-none'));
            Element.adminUserDashboard.addEventListener('click', async e => {
                try {
                    history.pushState(null, null, Route.routePathnames.DASHBOARD);
                    Element.root.innerHTML = '<h3>Loading content. Please wait...</h3>';
                    await dashboard_page();
                } catch (error) {
                    console.log('error: ', error);
                }
            });
        } else {
            // hide dashboard access
            adminLinks.forEach(link => link.classList.add('d-none'));
        }
    } else {
        // hide private links
        privateLinks.forEach(link => link.classList.add('d-none'));

        // show guest only links
        guestLinks.forEach(link => link.classList.remove('d-none'));
    }
}