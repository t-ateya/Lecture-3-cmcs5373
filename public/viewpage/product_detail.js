import * as Element from './element.js';
import * as Route from '../controller/route.js';
import * as Constant from '../model/constant.js';
import * as Util from './util.js';
import * as Auth from '../controller/auth.js';
import {
    Review
} from '../model/Review.js';


export function showProductDetail(product) {
    Element.root.innerHTML = '';
    // clone the page header
    const pageHeader = Element.templateProdutDetailHeader.cloneNode(true).content;
    pageHeader.querySelector('#back__home').addEventListener('click', event => {
        Util.disableButton(event.target);
        window.history.back();
        // Util.enableButton(label);
    });


    // clone the page body
    const pageBody = Element.templateProdutDetailBody.cloneNode(true).content;
    pageBody.querySelector('.detail__item__name').textContent = product.name;
    pageBody.querySelector('.detail__item__price').textContent = `$${product.price.toFixed(2)}`;
    pageBody.querySelector('.detail__item__stock').textContent = product.stock || 0;
    pageBody.querySelector('.detail__item__description').textContent = product.summary;
    pageBody.querySelector('.product__detail__image').src = product.imageURL;


    const li = document.createElement('li');
    li.classList.add('review__item');
    const reviewItem = Element.templateReviewItem.cloneNode(true).content;
    li.appendChild(reviewItem);

    // add delete event listener
    li.querySelector('.delete__review').addEventListener('click', () => {
        confirm('Are you sure you want to delete this review?');
    });

    // edit delete event listener
    li.querySelector('.edit__review').addEventListener('click', () => {
        Element.modalReview.show();
    });
    pageBody.querySelector('.review-list').appendChild(li);

    console.log(reviewItem);

    // clone the list
    Element.root.append(pageHeader, pageBody);

    // handle review form events
    Element.reviewForm.addEventListener('submit', e => {
        e.preventDefault();
        const starRating = e.target.starRating.value;
        const comment = e.target.comment.value;
        const review = new Review({
            starRating,
            comment,
            author: product.docId
        });
        console.log('review obj: ', review);
    });
}