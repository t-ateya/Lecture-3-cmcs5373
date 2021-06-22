import * as Element from '../viewpage/element.js'
import * as FirebaseController from './firebase_controller.js'

export function addEventListeners(){
    Element.formSignin.addEventListener('submit', async e =>{
        e.preventDefault(); //preventing page reloading
        const email = e.target.email.value;
        const password = e.target.password.value;
        //Next, we call a function in the firebase
        try {
            await FirebaseController.signIn(email, password);
            //Next, we dismiss the signin modal
            Element.modalSignIn.hide();
        } catch (error) {
            console.log(e);
        }

    })

}