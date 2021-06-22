import * as Element from '../viewpage/element.js'
import * as FirebaseController from './firebase_controller.js'
import * as Util from '../viewpage/util.js'
import * as Constant from '../model/constant.js'

export let currentUser;

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
            if (Constant.DeV)console.log(e);
            Util.info('Sign In Error', JSON.stringify(e), Element.modalSignIn)

        }

    })

    firebase.auth().onAuthStateChanged(async user =>{
        if (user){
            currentUser = user; //use just signed in
            let elements = document.getElementsByClassName('modal-pre-auth');
            for (let i = 0; i<elements.length; i++){
                elements[i].style.display = 'none';
            }
            elements = document.getElementsByClassName('modal-post-auth');
            for (let i = 0; i<elements.length; i++){
                elements[i].style.display = 'block';
            }
        }else {
            currentUser = null; //user just signed out
            elements = document.getElementsByClassName('modal-pre-auth');
            for (let i = 0; i<elements.length; i++){
                elements[i].style.display = 'block';
            }
            elements = document.getElementsByClassName('modal-post-auth');
            for (let i = 0; i<elements.length; i++){
                elements[i].style.display = 'none';
            }
        }
    })

}