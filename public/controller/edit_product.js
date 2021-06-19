import * as FirebaseController from "./firebase_controller.js"
import * as Util from "../viewpage/util.js";
import * as Constant from "../model/constant.js"
import * as Element from "../viewpage/element.js"
import { Product } from "../model/product.js";

let imageFile2Upload;

export function addEventListeners(){
    Element.formEditProduct.imageButton.addEventListener('change', e=>{
        imageFile2Upload = e.target.files[0];
        if (!imageFile2Upload){
            Element.formEditProduct.imageTag.src = null;
            //Element.formEditProduct.errorImage.innerHTML ='Image change cancelled. The original image will be used';
            Element.formEditProduct.errorImage.innerHTML ='';
            return;
        }
        const reader = new FileReader();
        reader.readAsDataURL(imageFile2Upload);
        reader.onload = ()=>Element.formEditProduct.imageTag.src = reader.result;
    })
    Element.formEditProduct.form.addEventListener('submit', e=> {
        e.preventDefault();
        const button = e.target.getElementByTagName('button')[0];
        const label = Util.disableButton(button);

        const p = new Product({
            name: e.target.name.value,
            price: e.target.price.value,
            price: e.target.summary.value,
        });
        p.docId = e.target.docId.value;

    });
}


export async function edit_product(docId){
    //console.log(docId)
    
    let product;
    try {
        product = await FirebaseController.getProductById(docId);
        if (!product){
            Util.info('getProductById error', 'No product found by the id');
            return;
        }

    } catch (e) {
        if (Constant.DEV)console.log(e);
        Util.info('getProductById Error', JSON.stringify(e))
        return;
        
    }

    //show product
    Element.formEditProduct.form.docId.value = product.docId;
    Element.formEditProduct.form.imageName.value = product.imageName;
    Element.formEditProduct.form.name.value = product.name
    Element.formEditProduct.form.price.value = product.price;
    Element.formEditProduct.form.summary.value = product.summary;
    Element.formEditProduct.imageTag.src = product.imageURL;
    Element.formEditProduct.errorImage.innerHTML = '';

    Element.modalEditProduct.show();

    
}