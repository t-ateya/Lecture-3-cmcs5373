import * as Element from "./element.js";
import * as Constant from "../model/constant.js";
import * as Util from "./util.js";
import * as Auth from "../controller/auth.js";

import {
    Review
} from "../model/Review.js";

import * as ReviewsController from "../controller/reviews_controller.js";

function buildPageHeader() {
    return `
    <!-- product detail header -->
        <div class="flex-row px-0 border-0 card body d-flex justify-content-between align-items-center">
            <h3>Product detail</h3>
            <div>
                <button class="btn btn-sm btn-primary d-none" id="edit-product">
                    <i class="bx bx-edit"></i>
                    edit product
                </button>
                <button class="btn btn-sm btn-outline-primary" id="back__home">
                    <i class="bx bx-left-arrow"></i>
                    go back
                </button>
            </div>
        </div>
        <hr class="bg-secondary">
        <!-- product detail header end -->
    `;
}

function buildProductDetails(product) {
    return `
         <!-- product details -->
        <div class="mt-5 row product-detail">
            <div class="col-md-4">
                <img src="${product.imageURL}" alt="product"
                    class="rounded rounded-lg img-fluid product__detail__image">
                <button class="mt-4 btn btn-outline-success btn-sm add__review__button">Add a review</button>
            </div>
            <div class="col-md-8">
                <div class="row">
                    <!-- left section -->
                    <ul class="list-unstyled detail col-md-9">
                        <li class="detail__item">
                            <p class="mb-0 font-weight-bold">Name:</p>
                            <p class="text-secondary detail__item__name">${product.name}</p>
                        </li>
                        <li class="detail__item">
                            <p class="mb-0 font-weight-bold">Price:</p>
                            <p class="text-secondary detail__item__price">$${product.price.toFixed(2)}</p>
                        </li>
                        <li class="detail__item">
                            <p class="mb-0 font-weight-bold">Stock:</p>
                            <p class="text-secondary detail__item__stock">${product.stock || 0}</p>
                        </li>
                        <li class="detail__item">
                            <p class="mb-0 font-weight-bold">description:</p>
                            <p class="text-secondary detail__item__description">
                                ${product.summary}
                            </p>
                        </li>
                    </ul>

                    <!-- right section -->
                    <ul class="pr-0 text-right list-unstyled text-secondary col-md-3 right-section">
                        <li class="text-right">
                            <p class="font-weight-bold text-dark">Average Rating</p>
                            <div class="review">
                                <div class="review__stars average__star__rating text-secondary">
                                    <i class="bx bxs-star"></i>
                                    <i class="bx bxs-star"></i>
                                    <i class="bx bxs-star"></i>
                                    <i class="bx bxs-star"></i>
                                    <i class="bx bxs-star"></i>
                                </div>
                                <p class="mt-0 review__rating text-secondary small">2.5/5</p>
                            </div>
                        </li>
                        <li>
                            <p class="mb-0 font-weight-bold text-dark">Reviews</p>
                            <p class="review__count">loading...</p>
                        </li>
                    </ul>
                </div>

                <!-- product reviews -->
                <div class="pb-3 mt-3 mb-2 reviews">
                    <h5 class="font-weight-bold">Reviews</h5>
                    <hr class="bg-secondary">

                    <!-- review list -->
                    <ul class="p-0 review-list list-unstyled">
                        <!-- review items -->

                    </ul>
                    <!-- review list end -->
                </div>
                <!-- product reviews end -->
            </div>
        </div>
        <!-- product details end -->
    `
}

export async function showProductDetail(product) {
    Element.root.innerHTML = "";

    Element.root.innerHTML += buildPageHeader();

    // handle back home button click event
    document.querySelector("#back__home").addEventListener("click", (event) => {
        Util.disableButton(event.target);
        window.history.back();
    });

    // clone the page body
    const pageBody = buildProductDetails(product);
    Element.root.innerHTML += pageBody;

    const addReviewBtn = document.querySelector('.add__review__button');


    // listen to add review event
    addReviewBtn.addEventListener('click', e => {
        Element.modalReview.show();
        // add star rating event listener
        setFormMode(Element.reviewForm, 'create');
        handleStarRating();
    });



    await showProductReviews();

    // handle review form events
    handleReviewFormEvents(product);
}

function handleReviewFormEvents(product) {
    Element.reviewForm.addEventListener("submit", async(e) => {
        e.preventDefault();
        const starRating = e.target.starRating.value || 0;
        const comment = e.target.comment.value;
        const review = new Review({
            starRating,
            comment,
            product: product.docId,
            author: Auth.currentUser.email,
        });
        try {
            const submitReviewBtn = Element.reviewForm.querySelector('.btn');
            const label = Util.disableButton(submitReviewBtn);
            // check if user is updating or creating a review
            if (Element.reviewForm.dataset.mode === 'create') {
                await ReviewsController.addReview(review.serialize());
            } else {
                await ReviewsController.editReview(review.serializeForUpdate());
            }

            await showProductReviews();
            e.target.reset();
            Util.enableButton(submitReviewBtn, label);
            // reset form stars
            resetStars(e.target);
            Element.modalReview.hide();
        } catch (error) {
            console.log("feebackerror: ", error);
        }
    });
}

function setFormMode(form, mode) {
    form.reset();
    resetStars(form);
    form.querySelector('button').textContent = 'save';
    form.dataset.mode = mode;
}

function updateReviewCount(reviewList, selectedProduct) {
    const count = reviewList.filter(r => r.product === selectedProduct.docId).length;
    document.querySelector('.review__count').textContent = count < 10 ? `0${count}` : count;
}

async function showProductReviews() {
    const reviewList = await ReviewsController.getReviewList();
    const selectedProduct = JSON.parse(localStorage.getItem('product'));
    updateReviewCount(reviewList, selectedProduct);

    setUpProductstarRating(reviewList, selectedProduct);

    document.querySelector(".review-list").innerHTML = '';

    // if if there is any product review in the entire firestore
    if (reviewList && reviewList.length > 0) {
        const currentProductReviews = reviewList
            .filter(review => review.product === selectedProduct.docId);

        // check if product has any reviews
        if (currentProductReviews.length > 0) {
            const reviewListContainer = document.querySelector('.review-list');
            /* loop through reviews */
            currentProductReviews.forEach((item) => {

                reviewListContainer.innerHTML += buildReviewListItem(item);

                // hightlight stars based on star rating on review
                const starList = Array.from(document.querySelectorAll(`review__${item.timestamp.seconds} .bxs-star`));
                starList.map(
                    (star, index) => index < item.stars ?
                    star.classList.add('text-warning') :
                    star.classList.remove('text-warning')
                );

                // hide review list buttons for other users.
                if (Auth.currentUser &&
                    (Auth.currentUser.email === item.author ||
                        Constant.adminEmails.includes(Auth.currentUser.email))
                ) {
                    document.querySelector(`#review__${item.timestamp.seconds} .review__buttons`).classList.remove('d-none');

                    if (Constant.adminEmails.includes(Auth.currentUser.email)) {
                        document.querySelector(`#review__${item.timestamp.seconds} .edit__review`).classList.add('d-none');
                    }

                    if (Constant.adminEmails.includes(item.author)) {
                        document.querySelector(`#review__${item.timestamp.seconds} .edit__review`).classList.remove('d-none');
                    }
                    // save this review to local storage
                    localStorage.setItem('review', JSON.stringify(item));
                } else {
                    document.querySelector(`#review__${item.timestamp.seconds} .review__buttons`).classList.add('d-none');
                }

                // add delete event listener
                const deleteReviewButton = document.querySelector(`#review__${item.timestamp.seconds} .delete__review`);
                deleteReviewButton.addEventListener("click", async() => {
                    const ok = confirm("Are you sure you want to delete this review?");
                    if (ok) {
                        await ReviewsController.deleteReview(item.docId);
                        Util.info('Delete successful', 'Your review has been successfully deleted');
                        await showProductReviews();
                    }
                });

                // edit delete event listener
                document.querySelector(`#review__${item.timestamp.seconds} .edit__review`).addEventListener("click", () => {
                    Element.modalReview.show();
                    setFormMode(Element.reviewForm, 'edit');
                    // add star rating event listener
                    handleStarRating();
                    const currentUserReview = JSON.parse(localStorage.getItem('review'));

                    // set the modal form to the value of the current review
                    Element.reviewForm.starRating.value = currentUserReview.stars;
                    Element.reviewForm.comment.value = currentUserReview.comment;
                    Element.reviewForm.querySelector('.review__start__rating').textContent = currentUserReview.stars;
                    const reviewFormStarList = Array.from(Element.reviewForm.querySelectorAll('.bxs-star'));
                    highLightStars(reviewFormStarList, currentUserReview.stars - 1);
                });

                // li.removeEventListener('click', handleEditReview);
                // li.addEventListener('click', handleEditReview);
            });

            // check if review include current user email
            if (Auth.currentUser) {
                const hasReview = currentProductReviews.find(review => review.author === Auth.currentUser.email);
                if (hasReview) {
                    document.querySelector('.add__review__button').classList.add('d-none');
                } else {
                    document.querySelector('.add__review__button').classList.remove('d-none');
                }
            } else {
                document.querySelector('.add__review__button').classList.add('d-none');
            }

        } else {
            showNoReviews();
            // add star rating event listener
            handleStarRating();
            return;
        }
    } else {
        showNoReviews();
        // add star rating event listener
        handleStarRating();
        return;
    }
}

function buildReviewListItem(item) {
    const {
        time,
        day,
        month,
        year
    } = Util.generateDateFromTimestamp(item.timestamp);
    const reviewDate = `${month} ${day}, ${year} at ${time}`;
    return `
    <li id="review__${item.timestamp.seconds}">
        <div class="d-flex justify-content-between align-items-center">
            <div class="d-flex align-items-start">
                <img src="https://picsum.photos/40" alt="avatar of client who reviewed the product"
                    class="border img-fluid rounded-circle border-primary review__item__image">
                <p class="flex-column d-flex">
                    <span class="review__item__name text-dark font-weight-bold">${item.author}</span>
                    <span class="review__item__date text-secondary small">${reviewDate}</span>
                </p>
            </div>
            <div class="review__stars text-secondary">
                <i class="bx bxs-star"></i>
                <i class="bx bxs-star"></i>
                <i class="bx bxs-star"></i>
                <i class="bx bxs-star"></i>
                <i class="bx bxs-star"></i>
            </div>
        </div>
        <p class="review__item__text text-secondary">
            ${item.comment}
        </p>
        <p class="mt-2 d-flex justify-content-end align-items-center review__buttons">
            <button class="mr-2 btn btn-link text-underline text-info bg-light edit__review"><i
                    class="bx bx-pencil"></i>
                edit</button>
            <button class="pr-0 mr-0 btn btn-link text-underline text-danger bg-light delete__review"><i
                    class="bx bx-trash"></i>
                delete</button>
        </p>
    </li>`;
}

function setUpProductstarRating(reviewList, selectedProduct) {
    // update average rating for product
    const averageRating = ReviewsController.getAverageRating(reviewList, selectedProduct);
    document.querySelector('.review__rating').textContent = `${averageRating}/5`;

    // highlight average star rating
    // average__star__rating
    const stars = Array.from(document.querySelectorAll('.average__star__rating .bxs-star'));
    stars.filter((_, index) => index < averageRating)
        .map(star => star.classList.add('text-warning'));
}

async function deleteProduct(event, product) {
    event.preventDefault();

}

function handleEditReview() {
    () => {
        Element.modalReview.show();
        setFormMode(Element.reviewForm, 'edit');
        // add star rating event listener
        handleStarRating();
        const currentUserReview = JSON.parse(localStorage.getItem('review'));

        // set the modal form to the value of the current review
        Element.reviewForm.starRating.value = currentUserReview.stars;
        Element.reviewForm.comment.value = currentUserReview.comment;
        Element.reviewForm.querySelector('.review__start__rating').textContent = currentUserReview.stars;
        const reviewFormStarList = Array.from(Element.reviewForm.querySelectorAll('.bxs-star'));
        highLightStars(reviewFormStarList, currentUserReview.stars);
    }
}

function showNoReviews() {
    const template = document.querySelector('.template-no-reviews').cloneNode(true).content;
    template.querySelector('.btn').addEventListener('click', e => {
        e.preventDefault();
        Element.modalReview.show();
    });
    document.querySelector(".review-list").append(template);
}

function handleStarRating() {
    const stars = Array.from(document.querySelectorAll('#modal-review .review__stars .bxs-star'));
    stars.forEach((star, index) => {
        star.addEventListener('click', e => {
            highLightStars(stars, index);
        });
    });
}

function highLightStars(starList, currentStarIndex) {
    starList.map(star => star.classList.remove('text-warning'));
    const rating = starList.filter((star, index) => index <= currentStarIndex)
        .map(star => star.classList.add('text-warning')).length;
    document.querySelector('.review__start__rating').textContent = rating;
    Element.reviewForm.starRating.value = rating;
}

function resetStars(form) {
    Array.from(form.querySelectorAll('.bxs-star')).map(star => star.classList.remove('text-warning'));
    form.starRating.value = 0;
    form.querySelector('.review__start__rating').textContent = 0;
}