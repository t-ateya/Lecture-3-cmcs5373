import * as Element from './element.js';
import * as Route from '../controller/route.js';
import * as FirebaseController from '../controller/firebase_controller.js';
import * as ReviewsController from "../controller/reviews_controller.js";
import * as Constant from '../model/constant.js';
import * as Util from './util.js';
import * as Auth from '../controller/auth.js';


export function addEventListeners() {
    Element.menuProfile.addEventListener('click', async(e) => {
        e.preventDefault();
        history.pushState(null, null, Route.routePathnames.PROFILE);
        // profile_page();
        await testPage();

    });
}

let accountInfo;
let carts;

// TODO: Update this to the real profile page func 
export async function testPage() {
    // get all reviews and save to local storage
    const allReviews = await ReviewsController.getReviewList();
    localStorage.setItem('reviews', JSON.stringify(allReviews));

    let html = '<h1> Profile Page </h1>';
    if (!Auth.currentUser) {
        html += '<h2>Protected Page</h2>';
        Element.root.innerHTML = html;
        return;
    }

    if (!accountInfo) {
        html += `<h2>Failed to retrieve account info for ${Auth.currentUser.email}</h2>`;
        Element.root.innerHTML = html;
        return;
    }

    carts = await getPurchaseHistory();

    html += buildProfileDetail(accountInfo);
    Element.root.innerHTML = html;
}


/* OLD PROFILE PAGE FUNC */
export async function profile_page() {
    let html = '<h1> Profile Page </h1>';
    if (!Auth.currentUser) {
        html += '<h2>Protected Page</h2>';
        Element.root.innerHTML = html;
        return;
    }

    if (!accountInfo) {
        html += `<h2>Failed to retrieve account info for ${Auth.currentUser.email}</h2>`;
        Element.root.innerHTML = html;
        return;
    }

    html += `
        <div class="alert alert-primary">
            Email: ${Auth.currentUser.email}(cannot change email as login name)
        </div>
    `;

    html += `
        <form class="form-profile" method="post">
            <table class="table table-sm">
            <tr>
                <td width="15%">Name:</td>
                <td width="60%">
                    <input type="text" name="name" value="${accountInfo.name}"
                        placeholder="firstname lastname" disabled required
                        pattern="^[A-Za-z][A-Za-z|'|-| ]+">
                </td>
                <td>${actionButtons()}</td>
            </tr>
            </table>
        </form>
    `;

    html += `
    <form class="form-profile" method="post">
        <table class="table table-sm">
        <tr>
            <td width="15%">Address:</td>
            <td width="60%">
                <input type="text" name="address" value="${accountInfo.address}"
                    placeholder="Address" disabled required
                    minlength="2">
            </td>
            <td>${actionButtons()}</td>
        </tr>
        </table>
    </form>
`;

    html += `
    <form class="form-profile" method="post">
        <table class="table table-sm">
        <tr>
            <td width="15%">City:</td>
            <td width="60%">
                <input type="text" name="city" value="${accountInfo.city}"
                    placeholder="City" disabled required
                    minlength="2">
            </td>
            <td>${actionButtons()}</td>
        </tr>
        </table>
    </form>
`;

    html += `
    <form class="form-profile" method="post">
        <table class="table table-sm">
        <tr>
            <td width="15%">State:</td>
            <td width="60%">
                <input type="text" name="state" value="${accountInfo.state}"
                    placeholder="State (uppercase 2 letter state code)" disabled required
                    pattern="[A-Z]+"
                    minlength="2" maxlength="2">
            </td>
            <td>${actionButtons()}</td>
        </tr>
        </table>
    </form>
`;

    html += `
    <form class="form-profile" method="post">
        <table class="table table-sm">
        <tr>
            <td width="15%">Zip:</td>
            <td width="60%">
                <input type="text" name="zip" value="${accountInfo.zip}"
                    placeholder="5 digit zip code" disabled required
                    pattern="[0-9]+"
                    minlength="5" maxlength="5">
            </td>
            <td>${actionButtons()}</td>
        </tr>
        </table>
    </form>
`;

    html += `
    <form class="form-profile" method="post">
        <table class="table table-sm">
        <tr>
            <td width="15%">Credit Card #:</td>
            <td width="60%">
                <input type="text" name="creditNo" value="${accountInfo.creditNo}"
                    placeholder="credit card number 16 digits" disabled required
                    pattern="[0-9]+"
                    minlength="16" maxlength="16">
            </td>
            <td>${actionButtons()}</td>
        </tr>
        </table>
    </form>
`;

    html += `
    <table>
        <tr>
            <td>
                <input type="file" id="profile-photo-upload-button" value="upload">
            </td>
            <td>
                <img id="profile-img-tag" src="${accountInfo.photoURL}" class="rounded-circle" width="250px">
            </td>
            <td>
                <button id="profile-photo-update-button" class="btn btn-outline-danger">Update Photo</button>
            </td>
        <tr>
    </table>
`;

    Element.root.innerHTML = html;
    let photoFile;

    const updateProfilePhotoButton = document.getElementById('profile-photo-update-button');
    updateProfilePhotoButton.addEventListener('click', async() => {
        if (!photoFile) {
            Util.info('No Photo Selected', 'Choose a profile photo');
            return;
        }
        const label = Util.disableButton(updateProfilePhotoButton);

        try {
            const photoURL = await FirebaseController.uploadProfilePhoto(photoFile, Auth.currentUser.uid);
            await FirebaseController.updateAccountInfo(Auth.currentUser.uid, {
                photoURL
            });
            accountInfo.photoURL = photoURL;
            Element.userProfileImage.innerHTML = `
                <img src=${accountInfo.photoURL} class="rounded-circle img-fluid" height="30px">
            `;
            Util.info('Success!', 'Profile Photo Updated!');
        } catch (e) {
            if (Constant.DeV) console.log(e);
            Util.info('Photo update error', JSON.stringify(e));
        }

        Util.enableButton(updateProfilePhotoButton, label);


    });

    document.getElementById('profile-photo-upload-button').addEventListener('change', e => {
        photoFile = e.target.files[0];
        if (!photoFile) {
            document.getElementById('profile-img-tag').src = accountInfo.photoURL;
            return;
        }

        const reader = new FileReader();
        reader.onload = () => document.getElementById('profile-img-tag').src = reader.result;
        reader.readAsDataURL(photoFile);
    });

    const forms = document.getElementsByClassName('form-profile');
    for (let i = 0; i < forms.length; i++) {
        forms[i].addEventListener('submit', async e => {
            e.preventDefault();
            const buttons = e.target.getElementsByTagName('button');
            const inputTag = e.target.getElementsByTagName('input')[0];
            const buttonLabel = e.target.submitter;
            const key = inputTag.name;
            const value = inputTag.value;

            if (buttonLabel == 'Edit') {
                buttons[0].style.display = 'none';
                buttons[1].style.display = 'inline-block';
                buttons[2].style.display = 'inline-block';
                inputTag.disabled = false;
            } else if (buttonLabel == 'Update') {
                const updateInfo = {}; //obj, updateInfo.xxx = yyy;
                updateInfo[key] = value;
                const label = Util.disableButton(buttons[1]);
                try {
                    await FirebaseController.updateAccountInfo(Auth.currentUser.uid, updateInfo);
                    accountInfo[key] = value;
                } catch (error) {
                    if (Constant.DeV) console.log(e);
                    Util.info(`Update Error: ${key}`, JSON.stringify(e));

                }
                Util.enableButton(buttons[1], label);

                buttons[0].style.display = 'inline-block';
                buttons[1].style.display = 'none';
                buttons[2].style.display = 'none';
                inputTag.disabled = true;

            } else {
                buttons[0].style.display = 'inline-block';
                buttons[1].style.display = 'none';
                buttons[2].style.display = 'none';
                inputTag.disabled = true;
                inputTag.value = accountInfo[key];
            }

        });
    }
}

function actionButtons() {
    return `
        <button onclick="this.form.submitter='Edit'"
            type="submit" class="btn btn-outline-primary">Edit</button>
        <button onclick="this.form.submitter='Update'"
            type="submit" class="btn btn-outline-danger" style="display: none;">Update</button>
        <button onclick="this.form.submitter='Cancel'" formnovalidate="true"
            type="submit" class="btn btn-outline-secondary" style="display: none;">Cancel</button>
    `;
}

function buildProfileDetail(accountInfo) {
    const user = Auth.currentUser;
    return `
        <div class="mt-5 row profile-detail mb-5 pb-4">
            <div class="col-md-3 text-center">
                <div>
                    <img src="${accountInfo.photoURL}" alt="product" class="rounded rounded-full img-fluid product__detail__image" height="5rem" width: "5rem">
                </div>
                <button class="mt-4 btn btn-secondary btn-sm upload__image__button">upload image</button>
            </div>
            <div class="col-md-9">
                <div class="row">
                    <!-- left section -->
                    <ul class="list-unstyled detail col-md-9">
                        <li class="detail__item">
                            <p class="mb-0 font-weight-bold">Name:</p>
                            <p class="text-secondary detail__profile__name">${accountInfo.name}</p>
                        </li>
                        <li class="detail__item">
                            <p class="mb-0 font-weight-bold">Email address:</p>
                            <p class="text-secondary detail__profile__email">${user.email}</p>
                        </li>
                        <li class="detail__item">
                            <p class="mb-0 font-weight-bold">Phone number:</p>
                            <p class="text-secondary detail__profile__phone">${user.telephone}</p>
                        </li>
                        <li class="detail__item">
                            <p class="mb-0 font-weight-bold">State:</p>
                            <p class="text-secondary detail__profile__state">${accountInfo.state}</p>
                        </li>
                        <li class="detail__item">
                            <p class="mb-0 font-weight-bold">City:</p>
                            <p class="text-secondary detail__profile__city">${accountInfo.city}</p>
                        </li>
                        <li class="detail__item">
                            <p class="mb-0 font-weight-bold">Address:</p>
                            <p class="text-secondary detail__profile__address">${accountInfo.address}</p>
                        </li>
                        <li class="detail__item">
                            <p class="mb-0 font-weight-bold">Zip Code:</p>
                            <p class="text-secondary detail__profile__zip">
                                ${accountInfo.zip}
                            </p>
                        </li>
                    </ul>

                    <!-- right section -->
                    <ul class="pr-0 text-right list-unstyled text-secondary col-md-3 right-section">
                        <li>
                            <p class="mb-0 font-weight-bold text-dark">Reviews</p>
                            <p class="review__count">${getUserReviews()} reviews</p>
                        </li>
                        <li class="delete">
                            <a href="#" class="px-0 btn btn-link text-danger delete__account__button">
                                delete account
                            </a>
                        </li>
                    </ul>
                </div>

                <!-- purchase history -->
                <div class="pb-3 mt-3 mb-2 purchase-history">
                    <h5 class="font-weight-bold">Purchase history</h5>
                    <hr class="bg-secondary">

                    <!-- purchase list -->
                    <div class="accordion accordion-flush" id="accordion">
                    ${carts.map((purchaseSummary, index) => buildAccordion(purchaseSummary, index))}
                    </div>
                    <!-- review list end -->
                </div>
                <!-- purchase history end -->
            </div>
        </div>
    `;
}

function getUserReviews() {
    const userReviews = JSON.parse(localStorage.getItem('reviews'));
    const filteredReviews = userReviews.filter(review => review.author === Auth.currentUser.email);
    return filteredReviews.length;
}

function buildAccordion(purchaseSummary, index) {
    console.log('purchase summary: ', purchaseSummary);
    return `
        <div class="accordion-item">
            <h2 class="accordion-header bg-light" id="flush-heading-${index}}">
                <button button class = "accordion-button bg-light collapsed"
                type = "button"
                data-bs-toggle = "collapse"
                data-bs-target = "#flush-collapse-${index}"
                aria-expanded = "false"
                aria-controls = "flush-collapseOne">
                    <div>
                        <p class="mb-0">${purchaseSummary.items.length} items purchased</p>
                        <p class="small text-muted mb-0">May 19, 2021</p>
                    </div>
                </button>
            </h2>
            <div id="flush-collapse-${index}" class="accordion-collapse collapse" aria-labelledby="flush-headingOne" data-bs-parent="#accordion">
                <div class="accordion-body purchase__list__items">
                    ${purchaseSummary.items.map(item => buildPurchaseListItem(item)) }
                </div>
            </div>
        </div>
    `;
}


function buildPurchaseListItem(item) {
    console.log('item: ', item);
    return `
    <div class="row">
        <div class="col-md-3">
            <img src="${item.imageURL}" alt="product purchased" class="img-fluid">
        </div>
        <div class="col-md-9">
            <div class="d-flex justify-content-between align-items-start">
                <ul class="list-unstyled">
                    <li class="d-flex align-items-center mb-2 ">
                        <p class="mb-0 " style="width: 8rem ">Name: </p>
                        <p class="mb-0 ">${item.name}</p>
                    </li>
                    <li class="d-flex align-items-center mb-2 ">
                        <p class="mb-0 " style="width: 8rem ">Price</p>
                        <p class="mb-0 ">${item.price}</p>
                    </li>
                    <li class="d-flex align-items-center mb-2 ">
                        <p class="mb-0 " style="width: 8rem ">Qty</p>
                        <p class="mb-0 ">${item.qty}</p>
                    </li>
                </ul>
                <div class="right text-secondary">
                    <p class="fone-weight-bold text-uppercase mb-0">TOTAL</p>
                    <p>$${item.price * item.qty}</p>
                </div>
            </div>
        </div>
    </div>
    `;
}

async function getPurchaseHistory() {
    const carts = await FirebaseController.getPurchaseHistory(Auth.currentUser.uid);
    return carts;
}

export async function getAccountInfo(user) {
    try {
        accountInfo = await FirebaseController.getAccountInfo(user.uid);
    } catch (e) {
        if (Constant.DeV) console.log(e);
        Util.info(`Failed to retrieve account info for ${user.email}`, JSON.stringify(e));
        accountInfo = null;
        return;
    }
    Element.userProfileImage.innerHTML = `
        <img src=${accountInfo.photoURL} class="rounded-circle img-fluid showdow-sm border-2 border-light profile-image" height="50" width="50">
    `;

}