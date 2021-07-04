import * as Element from './element.js'

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