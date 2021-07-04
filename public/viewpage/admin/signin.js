import * as Element from "../element.js";
import * as Route from "../../controller/route.js";
import * as Util from "../util.js";
import * as Constant from "../../model/constant.js";
import * as FirebaseController from '../../controller/firebase_controller.js';
import * as Auth from "../../controller/auth.js";
import {
    dashboard_page
} from "./dashboard_page.js";


export function addEventListeners() {
    Element.adminSignIn.addEventListener("click", () => {
        history.pushState(null, null, Route.routePathnames.ADMIN_LOGIN);
        const label = Util.disableButton(Element.adminSignIn);
        signIn();
        Util.enableButton(Element.adminSignIn, label);
    });
}

export function signIn() {
    Element.root.innerHTML = '';
    if (!Auth.currentUser) {
        Element.root.innerHTML = adminForm;

        // handle admin form submit
        handleAdminLogin();
    } else {
        dashboard_page();
    }
}

function handleAdminLogin() {
    const form = document.querySelector("#admin-login-form");
    form.addEventListener('submit', async(e) => {
        e.preventDefault();
        // get form details
        const {
            email,
            password,
            submitButton
        } = getFormDetails(form);

        if (Constant.adminEmails.includes(email)) {
            try {
                const label = Util.disableButton(submitButton);
                await FirebaseController.signIn(email, password);
                // route to the admin dashboard page
                // show the dashboard page
                dashboard_page();
                form.classList.add('d-none'); // hide login form
                Util.enableButton(submitButton, label);
            } catch (error) {
                if (Constant.DeV) {
                    console.log('Admin authentication error: ', console.log(error));
                }
            }
        } else {
            // show error saying only for adims
            alert('Sorry, only for admins');
        }
    });


}

function getFormDetails(form) {
    const email = form.email.value.trim();
    const password = form.password.value;
    const submitButton = form.submitButton;
    return {
        email,
        password,
        submitButton
    };
}

const adminForm = `
 <div class="row">
      <div class="col-md-6 col-lg-4 col-xl-3 mx-auto">
        <form id="admin-login-form">
            <h1 class="h3 mb-3 fw-normal text-center mb-2">Admin? Sign in. 😊</h1>

            <div class="form-floating">
                <input type="email"
                class="form-control"
                name="email"
                id="admin-email"
                placeholder="name@example.com">
                <label for="admin-email">Email address</label>
            </div>
            <div class="form-floating">
                <input type="password" class="form-control" name="password" id="admin-password" placeholder="Password">
                <label for="admin-password">Password</label>
            </div>
            <button class="w-100 btn btn-lg btn-primary" name="submitButton" type="submit">Sign in</button>
        </form>
      </div>
    </div>
`;