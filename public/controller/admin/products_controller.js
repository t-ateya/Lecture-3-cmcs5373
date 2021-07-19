import {
    Product
} from "../../model/Product.js";
import * as Constant from "../../model/constant.js";

// @ts-nocheck

const cf_addProduct = firebase.functions().httpsCallable("cf_addProduct");
export async function addProduct(product) {
    await cf_addProduct(product);
}

export async function uploadImage(imageFile, imageName) {
    if (!imageName) {
        imageName = Date.now() + imageFile.name;
    }

    const ref = firebase
        .storage()
        .ref()
        .child(Constant.storageFolderNames.PRODUCT_IMAGES + imageName);
    const taskSnapShot = await ref.put(imageFile);
    const imageURL = await taskSnapShot.ref.getDownloadURL();
    return {
        imageName,
        imageURL,
    };
}

const cf_getProductList = firebase
    .functions()
    .httpsCallable("cf_getProductList");
export async function getProductList() {
    const products = [];
    const result = await cf_getProductList(); //result.data

    // get the total number of product in database
    // const totalProducts = result.length;

    // calculate number of pages based on the pagination config
    // const pages = Number.parseInt(Number.parseInt(totalProducts) / 8);

    // << prev and next >>
    // 1 - 8, 9 - 
    // current page (1, 2, 3, ... n)
    // current cursor position ( page * items = page * 8)
    // next page: curPos = (curPos + 1 - [(page + 1) * 8])
    // next page: curPos = (curPos - 1 - [(page + 1) * 8])

    result.data.forEach((data) => {
        const p = new Product(data);
        p.docId = data.docId;
        products.push(p);
    });
    return products;
}

const cf_getProductById = firebase
    .functions()
    .httpsCallable("cf_getProductById");
export async function getProductById(docId) {
    const result = await cf_getProductById(docId);
    if (result.data) {
        const product = new Product(result.data);
        product.docId = result.data.docId;
        return product;
    } else {
        return null;
    }
}

const cf_updateProduct = firebase.functions().httpsCallable("cf_updateProduct");
export async function updateProduct(product) {
    const docId = product.docId;
    const data = product.serializeForUpdate();
    await cf_updateProduct({
        docId,
        data,
    });
}

const cf_deleteProduct = firebase.functions().httpsCallable("cf_deleteProduct");
export async function deleteProduct(docId, imageName) {
    await cf_deleteProduct(docId);
    const ref = firebase
        .storage()
        .ref()
        .child(Constant.storageFolderNames.PRODUCT_IMAGES + imageName);
    await ref.delete();
}