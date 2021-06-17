import * as FirebaseController from "./firebase_controller.js"
import * as Util from "../viewpage/util.js";
import * as Constant from "../model/constant.js"


export async function edit_product(docId){
    console.log(docId)
    /*
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
    */
}