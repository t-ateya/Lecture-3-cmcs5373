import { Product } from "./Product.js";

export class ShoppingCart{
    //we attach the uid of the owner of the shoppingcart
    constructor(uid){
        this.uid = uid;
        this.items = []; //stores array of serialized Product objects
    }

    addItem(product){
        const item = this.items.find(e => product.docId == e.docId);
        if (!item){
            //new item
            product.qty = 1;
            const newItem = product.serialize();
            newItem.docId = product.docId;
            this.items.push(newItem);
        }else {
            ++product.qty;
            ++item.qty;
        }
        this.saveToLocalStorage();
    }

    removeItem(product){
        //dec qty or remove if qty becomes zero
        const index = this.items.findIndex(e => product.docId == e.docId);
        if (index < 0) return; //product not found, return

        --this.items[index].qty;
        --product.qty;
        //Next, we remove the item from the shopping card if the qty is zero
        if (product.qty == 0){
            this.items.splice(index, 1);
            
        }
        this.saveToLocalStorage();
    }

    saveToLocalStorage() {
        window.localStorage.setItem(`cart-${this.uid}`, this.stringify())
    }
      
    stringify(){
        return JSON.stringify({uid: this.uid, items: this.items});
    }

    static parse(cartString){
        if (!cartString) return null;
        const obj = JSON.parse(cartString); //JS object created. JS obj is the opposite of stringify
        const sc = new ShoppingCart(obj.uid);
        sc.items = obj.items;
        return sc;
    }

    isValid(){
        if (!this.uid) return false;
        if (!this.items || !Array.isArray(this.items))return false;
        for (let i = 0; i<this.items.length; i++){
            if (!Product.isSerializedProduct(this.items[i])) return false;
        }
        return true;
    }

    getTotalQty(){
        let n = 0;
        this.items.forEach(e =>{n +=e.qty})
        return n;
    }

    getTotalPrice(){
        let total = 0;
        this.items.forEach(item =>{
            total += item.price * item.qty;
        })
        return total;
    }

    empty(){
        this.items.length = 0;
    }
}