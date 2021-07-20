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

export function generateDateFromTimestamp(firebaseTimestamp) {
    const date = new Date(firebaseTimestamp.toDate());
    const time = generateTime(date.getTime());
    const day = date.getDate();
    const month = date.toLocaleString('default', {
        month: 'short'
    });
    const year = date.getFullYear();
    return {
        time,
        day,
        month,
        year
    };
}

function generateTime(unixTimestamp) {
    // the time into milliseconds by multiplying it by 1000.
    let date = new Date(unixTimestamp * 1000);
    // Hours part from the timestamp
    let hours = date.getHours();
    // Minutes part from the timestamp
    let minutes = "0" + date.getMinutes();
    // Seconds part from the timestamp
    let seconds = "0" + date.getSeconds();
    // Will display time in 11:10:22 format
    let formatTime = hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);

    return formatTime;
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
                Element.root.innerHTML = 'loading...';
                try {
                    Element.root.innerHTML = '<h3>Loading content. Please wait...</h3>';
                    await dashboard_page();
                    // history.pushState(null, null, Route.routePathnames.DASHBOARD);
                    // Route.routing(Route.routePathnames.DASHBOARD, window.location.hash);
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