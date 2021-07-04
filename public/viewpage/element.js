// @ts-nocheck
//ROOT element
export const root = document.getElementById('root');

//top menus
export const menuSignIn = document.getElementById('menu-signin');
export const menuHome = document.getElementById('menu-home');
export const menuPurchases = document.getElementById('menu-purchases');
export const menuSignOut = document.getElementById('menu-signout');
export const menuCart = document.getElementById('menu-cart');
export const menuProfile = document.getElementById('menu-profile');
export const shoppingCartCount = document.getElementById('shoppingcart-count');


//forms
export const formSignin = document.getElementById('form-signin');
export const formSignup = document.getElementById('form-signup');
export const formSignupPasswordError = document.getElementById('form-signup-password-error');

export const buttonSignup = document.getElementById('button-signup');

//modals
export const modalSignIn = new bootstrap.Modal(document.getElementById('modal-signin'), {
    backdrop: 'static'
});
export const modalInfo = new bootstrap.Modal(document.getElementById('modal-info'), {
    backdrop: 'static'
});
export const modalInfoTitle = document.getElementById('modal-info-title');
export const modalInfoBody = document.getElementById('modal-info-body');
export const modalTransactionView = new bootstrap.Modal(document.getElementById('modal-transaction-view'), {
    backdrop: 'static'
});
export const modalTransactionTitle = document.getElementById('modal-transaction-title');
export const modalTransactionBody = document.getElementById('modal-transaction-body');
export const modalSignup = new bootstrap.Modal(document.getElementById('modal-signup'), {
    backdrop: 'static'
});


/* Admin elements */
// menus
export const userNavbar = document.querySelector('#user-nav');
export const adminSignIn = document.getElementById('admin-signin');
export const adminNavbar = document.querySelector('#admin-nav');
export const adminDashboard = document.querySelector('#admin-dashboard');
export const adminUsers = document.querySelector('#admin-users');
export const adminProducts = document.querySelector('#admin-products');
export const adminProfile = document.querySelector('#admin-profile');
export const adminSignOut = document.querySelector('#admin-sign-out');

// products
export const formAddProduct = {
    form: document.getElementById('form-add-product'),
    errorName: document.getElementById('form-add-product-error-name'),
    errorPrice: document.getElementById('form-add-product-error-price'),
    errorSummary: document.getElementById('form-add-product-error-summary'),
    imageTag: document.getElementById('form-add-product-image-tag'),
    imageButton: document.getElementById('form-add-product-image-button'),
    errorImage: document.getElementById('form-add-product-error-image'),
};

export const formEditProduct = {
    form: document.getElementById('form-edit-product'),
    errorName: document.getElementById('form-edit-product-error-name'),
    errorPrice: document.getElementById('form-edit-product-error-price'),
    errorSummary: document.getElementById('form-edit-product-error-summary'),
    imageTag: document.getElementById('form-edit-product-image-tag'),
    imageButton: document.getElementById('form-edit-product-image-button'),
    errorImage: document.getElementById('form-edit-product-error-image'),
};

// modals
export const modalAddProduct = new bootstrap.Modal(document.getElementById('modal-add-product'), {
    backdrop: 'static'
});

export const modalEditProduct = new bootstrap.Modal(document.getElementById('modal-edit-product'), {
    backdrop: 'static'
});