import {
    AccountInfo
} from '../model/account_info.js';
import * as Constant from '../model/constant.js';
import {
    Product
} from '../model/Product.js';
import {
    ShoppingCart
} from '../model/ShoppingCart.js';

export async function signIn(email, password) {
    await firebase.auth().signInWithEmailAndPassword(email, password);
}

export async function signOut() {
    await firebase.auth().signOut();
}

export async function nextPage() {
    const {
        lastProduct
    } = JSON.parse(localStorage.getItem('pagination'));
    // const cursorPosition = (page * 8) + 1;
    const products = [];
    const snapShots = await firebase.firestore().collection(Constant.collectionNames.PRODUCTS)
        .orderBy('name')
        .startAfter(lastProduct.name)
        .limit(8)
        .get();
    let last;
    if (snapShots.docs.length > 0) {
        snapShots.forEach(doc => {
            const p = new Product(doc.data());
            p.docId = doc.id;
            products.push(p);
            last = doc.data();
        });
        localStorage.setItem('pagination', JSON.stringify({
            firstProduct: products[0],
            lastProduct: last
        }));

        return products;
    }

    return null;

}

export async function prevPage() {
    const {
        firstProduct,
    } = JSON.parse(localStorage.getItem('pagination'));
    // const cursorPosition = (page * 8) - 1;
    const products = [];
    const snapShots = await firebase.firestore().collection(Constant.collectionNames.PRODUCTS)
        .orderBy('name')
        .endBefore(firstProduct.name)
        .limitToLast(8)
        .get();
    let last;
    if (snapShots.docs.length > 0) {
        snapShots.forEach(doc => {
            const p = new Product(doc.data());
            p.docId = doc.id;
            products.push(p);
            last = doc.data();
        });
        localStorage.setItem('pagination', JSON.stringify({
            firstProduct: products[0],
            lastProduct: last,
        }));

        return products;
    }
    return null;

}

export async function getProductList() {
    const products = []; //create array of product objects
    const first = await firebase.firestore().collection(Constant.collectionNames.PRODUCTS)
        .orderBy('name')
        .limit(8)
        .get();
    let lastProduct;
    first.forEach((doc, index = 1) => {
        const p = new Product(doc.data());
        p.docId = doc.id;
        products.push(p);
        lastProduct = doc.data();
    });

    localStorage.setItem('pagination', JSON.stringify({
        firstProduct: products[0],
        lastProduct: lastProduct
    }));
    return products;
}

export async function checkOut(cart) {
    const data = cart.serialize(Date.now());
    await firebase.firestore().collection(Constant.collectionNames.PURCHASE_HISTORY)
        .add(data);

}

export async function getPurchaseHistory(uid) {
    const snapShot = await firebase.firestore().collection(Constant.collectionNames.PURCHASE_HISTORY)
        .where('uid', '==', uid)
        .orderBy('timestamp', 'desc')
        .get();
    const carts = [];
    snapShot.forEach(doc => {
        const sc = ShoppingCart.deserialize(doc.data());
        carts.push(sc);
    });
    return carts;

}

export async function createUser(email, password) {
    await firebase.auth().createUserWithEmailAndPassword(email, password);
}

export async function getAccountInfo(uid) {
    const doc = await firebase.firestore().collection(Constant.collectionNames.ACCOUNT_INFO)
        .doc(uid)
        .get();
    if (doc.exists) {
        return new AccountInfo(doc.data());
    } else {
        const defaultInfo = AccountInfo.instance();
        await firebase.firestore().collection(Constant.collectionNames.ACCOUNT_INFO)
            .doc(uid).set(defaultInfo.serialize());
        return defaultInfo;
    }

}

export async function updateAccountInfo(uid, updateInfo) {
    //updateInfo = {key:value}
    await firebase.firestore().collection(Constant.collectionNames.ACCOUNT_INFO)
        .doc(uid).update(updateInfo);
}

export async function uploadProfilePhoto(photoFile, imageName) {
    const ref = firebase.storage().ref()
        .child(Constant.storageFolderNames.PROFILE_PHOTOS + imageName);
    const taskSnapShot = await ref.put(photoFile);
    const photoURL = await taskSnapShot.ref.getDownloadURL();
    return photoURL;
}

export async function searchProduct(nameQuery) {
    console.log('query: ', nameQuery);
    const snapShots = await firebase.firestore().collection(Constant.collectionNames.PRODUCTS)
        .orderBy('name')
        .get();
    const products = [];
    snapShots.forEach((doc) => {
        const p = new Product(doc.data());
        p.docId = doc.id;
        products.push(p);
    });

    const searchResult = products.filter(product => product.name.includes(nameQuery));

    return searchResult;
}