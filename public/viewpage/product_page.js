import { Product } from "../model/product.js";
import * as Element from "./element.js";
import * as FirebaseController from "../controller/firebase_controller.js";
import * as Constant from "../model/constant.js";
import * as Util from "./util.js";
import * as Route from "../controller/routes.js";
import * as Edit from '../controller/edit_product.js';
import * as Auth from '../controller/auth.js'


let imageFile2Upload;

export function addEventListeners() {
  Element.menuProducts.addEventListener("click", async () => {
    history.pushState(null, null, Route.routePathname.PRODUCTS);
    const button = Element.menuProducts;
    const label = Util.disableButton(button);
    await product_page();
    //await Util.sleep(1000);
    Util.enableButton(button, label);
  });

  Element.formAddProduct.form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const button = e.target.getElementsByTagName("button")[0];
    const label = Util.disableButton(button);
    await addNewProduct(e.target);
    await product_page();
    Util.enableButton(button, label);
  });

  Element.formAddProduct.imageButton.addEventListener("change", (e) => {
    imageFile2Upload = e.target.files[0];
    if (!imageFile2Upload) {
      Element.formAddProduct.imageTag.src = null;
      return;
    }
    const reader = new FileReader();
    reader.onload = () => (Element.formAddProduct.imageTag.src = reader.result);
    reader.readAsDataURL(imageFile2Upload);
  });
}

export async function product_page() {
  if (!Auth.currentUser) return;
  
  let html = `
        <div>
            <button id="button-add-product" class="btn btn-outline-danger">+ Add Product</button>

        </div>
    
    `;

  let products;
  try {
    products = await FirebaseController.getProductList();
  } catch (e) {
    if (Constant.DEV) console.log(e);
    Util.info("Cannot get product list", JSON.stringify(e));
    return;
  }

  //render products

  products.forEach((p) => {
    html += buildProductCard(p);
  });

  Element.root.innerHTML = html; //rendering products on the web-browser(root element)

  document
    .getElementById("button-add-product")
    .addEventListener("click", () => {
      Element.formAddProduct.form.reset();
      Element.formAddProduct.imageTag.src = "";
      imageFile2Upload = null;
      Element.modalAddProduct.show();
    });
    const editForms = document.getElementsByClassName('form-edit-product'); //get all the forms for product
    for (let i =0; i < editForms.length; i++){
        editForms[i].addEventListener('submit', async e =>{
          e.preventDefault(); //prevents form reload when the form submits
          const button = e.target.getElementsByTagName('button')[0] //N.B: The target is the form
          const label = Util.disableButton(button);
         await  Edit.edit_product(e.target.docId.value)// e.target===form
         Util.enableButton(button, label);
        });
    }
    const deleteForms = document.getElementsByClassName('form-delete-product');
    for (let i = 0; i<deleteForms.length; i++){
      deleteForms[i].addEventListener('submit', async e=>{
          e.preventDefault();
          if (!window.confirm("Press OK to delete")) return; //cancel button pressed
          const button = e.target.getElementsByTagName('button')[0];
          const label = Util.disableButton(button);

          Util.enableButton(button, label);
          await Edit.delete_product(e.target.docId.value, e.target.imageName.value);


      })
    }

}

async function addNewProduct(form) {
  const name = form.name.value;
  const price = form.price.value;
  const summary = form.summary.value;

  const product = new Product({ name, price, summary }); //Product object

  const errors = product.validate(imageFile2Upload);

  Element.formAddProduct.errorName.innerHTML = errors.name ? errors.name : "";
  Element.formAddProduct.errorPrice.innerHTML = errors.price
    ? errors.price
    : "";
  Element.formAddProduct.errorSummary.innerHTML = errors.summary
    ? errors.summary
    : "";
  Element.formAddProduct.errorImage.innerHTML = errors.image
    ? errors.image
    : "";

  if (Object.keys(errors).length != 0) return; //error exists

  //save the product object in Firebase
  //  1. upload the image into Cloud storage => image name, url
  //  2. Store product info to Firebase with image info

  try {
    const { imageName, imageURL } = await FirebaseController.uploadImage(
      imageFile2Upload
    );
    product.imageName = imageName;
    product.imageURL = imageURL;
    await FirebaseController.addProduct(product.serialize());
    Util.info("Success!", `${product.name} added!`, Element.modalAddProduct);
  } catch (e) {
    if (Constant.DEV) console.log(e);
    Util.info("Add Product failed", JSON.stringify(e), Element.modalAddProduct);
  }
}

function buildProductCard(product) {
  return `
    <div id="card-${product.docId}" class="card" style="width: 18rem; display: inline-block">
        <img src="${product.imageURL}" class="card-img-top">
        <div class="card-body">
            <h5 class="card-title">${product.name}</h5>
            <p class="card-text">$ ${product.price}<br>${product.summary}</p>
        </div>
        <form class="form-edit-product float-start" method="post">
            <input type="hidden" name="docId" value="${product.docId}">
            <button class="btn btn-outline-primary" type="submit">Edit</button>
        <form/>
        <form class="form-delete-product float-end" method="post">
            <input type="hidden" name="docId" value="${product.docId}">
            <input type="hidden" name="imageName" value="${product.imageName}">
            <button class="btn btn-outline-danger" type="submit">Delete</button>
        <form/>
    </div>
    `;
}
