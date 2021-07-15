import * as Element from "./element.js";
import * as Constant from "../model/constant.js";
import * as Util from "./util.js";
import * as Auth from "../controller/auth.js";
import {
    Review
} from "../model/Review.js";

import * as ReviewsController from "../controller/reviews_controller.js";

export async function showProductDetail(product) {
    Element.root.innerHTML = "";
    // clone the page header
    const pageHeader = Element.templateProdutDetailHeader.cloneNode(true).content;
    pageHeader.querySelector("#back__home").addEventListener("click", (event) => {
        Util.disableButton(event.target);
        window.history.back();
    });

    // clone the page body
    const pageBody = Element.templateProdutDetailBody.cloneNode(true).content;
    const addReviewBtn = pageBody.querySelector('.add__review__button');
    pageBody.querySelector(".detail__item__name").textContent = product.name;
    pageBody.querySelector(
        ".detail__item__price"
    ).textContent = `$${product.price.toFixed(2)}`;
    pageBody.querySelector(".detail__item__stock").textContent =
        product.stock || 0;
    pageBody.querySelector(".detail__item__description").textContent =
        product.summary;
    pageBody.querySelector(".product__detail__image").src = product.imageURL;

    // hide delete product if user is admin
    if (Constant.adminEmails.includes(Auth.currentUser.email)) {
        pageBody.querySelector('.delete__product__button').classList.remove('d-none');
    } else {
        pageBody.querySelector('.delete__product__button').classList.add('d-none');
    }


    // show page header and page content (product details)
    Element.root.append(pageHeader, pageBody);

    // listen to add review event
    addReviewBtn.addEventListener('click', e => {
        Element.modalReview.show();
        // add star rating event listener
        setFormMode(Element.reviewForm, 'create');
        handleStarRating();
    });

    await showProductReviews();

    // handle review form events
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
                const ref = await ReviewsController.editReview(review.serializeForUpdate());
                console.log('Update successful: ', ref);
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

    // update average rating for product
    const averageRating = ReviewsController.getAverageRating(reviewList, selectedProduct);
    document.querySelector('.review__rating').textContent = `${averageRating}/5`;

    // highlight average star rating
    // average__star__rating
    const stars = Array.from(document.querySelectorAll('.average__star__rating .bxs-star'));
    stars.filter((_, index) => index < averageRating)
        .map(star => star.classList.add('text-warning'));

    document.querySelector(".review-list").innerHTML = '';
    if (reviewList && reviewList.length > 0) {
        const currentProductReviews = reviewList.filter(review => review.product === selectedProduct.docId);
        if (currentProductReviews.length > 0) {
            /* loop through reviews */
            currentProductReviews.forEach((item) => {
                const li = document.createElement("li");
                li.classList.add("review__item");

                const reviewItem = Element.templateReviewItem.cloneNode(true).content;
                reviewItem.querySelector(".review__item__name").textContent = item.author; // user email
                const {
                    day,
                    month,
                    year
                } = Util.generateDateFromTimestamp(item.timestamp);
                const reviewDate = `${month} ${day}, ${year}`;
                reviewItem.querySelector(".review__item__date").textContent = reviewDate;
                reviewItem.querySelector(".review__item__text").textContent = item.comment;

                // hightlight stars based on star rating on review
                const starList = Array.from(reviewItem.querySelectorAll('.bxs-star'));
                starList.map(
                    (star, index) => index < item.stars ?
                    star.classList.add('text-warning') :
                    star.classList.remove('text-warning')
                );

                // hide review list buttons for other users.
                if (Auth.currentUser.email === item.author || Constant.adminEmails.includes(Auth.currentUser.email)) {
                    reviewItem.querySelector('.review__buttons').classList.remove('d-none');

                    if (Constant.adminEmails.includes(Auth.currentUser.email)) {
                        console.log('admin user');
                        reviewItem.querySelector('.edit__review').classList.add('d-none');
                    }

                    if (Constant.adminEmails.includes(item.author)) {
                        reviewItem.querySelector('.edit__review').classList.remove('d-none');
                    }
                    // save this review to local storage
                    localStorage.setItem('review', JSON.stringify(item));
                } else {
                    reviewItem.querySelector('.review__buttons').classList.add('d-none');
                }

                li.appendChild(reviewItem);

                document.querySelector(".review-list").appendChild(li);

                // add delete event listener
                li.querySelector(".delete__review").addEventListener("click", async() => {
                    const ok = confirm("Are you sure you want to delete this review?");
                    if (ok) {
                        await ReviewsController.deleteReview(item.docId);
                        Util.info('Delete successful', 'Your review has been successfully deleted');
                        await showProductReviews();
                    }
                });

                // edit delete event listener
                li.querySelector(".edit__review").addEventListener("click", () => {
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
            if (currentProductReviews.find(review => review.author === Auth.currentUser.email)) {
                document.querySelector('.add__review__button').classList.add('d-none');
            } else {
                document.querySelector('.add__review__button').classList.remove('d-none');
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