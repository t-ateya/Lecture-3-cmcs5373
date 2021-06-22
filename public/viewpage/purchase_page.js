import * as Element from './element.js'

export function addEventListeners(){
    Element.menuPurchases.addEventListener('click', async()=>{
        await purchase_page();
    });
}

export async function purchase_page(){
    Element.root.innerHTML = '<h1> Purchases Page </h1>'
}