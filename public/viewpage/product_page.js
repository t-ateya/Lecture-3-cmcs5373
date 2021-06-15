import { Product } from '../model/product.js';
import * as Element from './element.js'

let imageFile2Upload

export function addEventListeners(){
    Element.menuProducts.addEventListener('click', async() =>{
        await product_page();
    });

    Element.formAddProduct.form.addEventListener('submit', e=>{
        e.preventDefault();
        addNewProduct(e.target);

    });

    Element.formAddProduct.imageButton.addEventListener('change', e=>{
        imageFile2Upload = e.target.files[0];
        if (!imageFile2Upload){
            Element.formAddProduct.imageTag.src = null;
            return;
        }
        const reader = new FileReader();
        reader.onload = ()=>Element.formAddProduct.imageTag.src = reader.result
        reader.readAsDataURL(imageFile2Upload);
    })
}

export async function product_page(){
    let html = `
        <div>
            <button id="button-add-product" class="btn btn-outline-danger">+ Add Product</button>

        </div>
    
    `;

    Element.root.innerHTML = html;

document.getElementById('button-add-product').addEventListener('click', () =>{

        Element.modalAddProduct.show();
    });

}

function addNewProduct(form){
    const name = form.name.value;
    const price = form.price.value;
    const summary = form.summary.value;

    const product = new Product({name, price, summary}); //Product object

    const errors = product.validate(imageFile2Upload);

    Element.formAddProduct.errorName.innerHTML = errors.name ? errors.name : '';
    Element.formAddProduct.errorPrice.innerHTML = errors.price ? errors.price : '';
    Element.formAddProduct.errorSummary.innerHTML = errors.summary ? errors.summary : '';
    Element.formAddProduct.errorImage.innerHTML = errors.image ? errors.image : '';

    if (Object.keys(errors).length !=0) return ; //error exists

    //save the product object in Firebase
      //  1. upload the image into Cloud storage => image name, url
      //  2. Store product info to Firebase with image info
        

}