import * as Element from "./element.js";
import * as Route from "../controller/route.js";
import * as Constant from "../model/constant.js";
import * as Util from "./util.js";
import * as Auth from "../controller/auth.js";
import { Review } from "../model/Review.js";

import * as ReviewsController from "../controller/reviews_controller.js";

export function showProductDetail(product) {
  Element.root.innerHTML = "";
  // clone the page header
  const pageHeader = Element.templateProdutDetailHeader.cloneNode(true).content;
  pageHeader.querySelector("#back__home").addEventListener("click", (event) => {
    Util.disableButton(event.target);
    window.history.back();
    // Util.enableButton(label);
  });

  // clone the page body
  const pageBody = Element.templateProdutDetailBody.cloneNode(true).content;
  pageBody.querySelector(".detail__item__name").textContent = product.name;
  pageBody.querySelector(
    ".detail__item__price"
  ).textContent = `$${product.price.toFixed(2)}`;
  pageBody.querySelector(".detail__item__stock").textContent =
    product.stock || 0;
  pageBody.querySelector(".detail__item__description").textContent =
    product.summary;
  pageBody.querySelector(".product__detail__image").src = product.imageURL;

  pageBody.querySelector(".review-list").appendChild(li);

  console.log(reviewItem);

  // clone the list
  Element.root.append(pageHeader, pageBody);

  // handle review form events
  Element.reviewForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const starRating = e.target.starRating.value;
    const comment = e.target.comment.value;
    const review = new Review({
      starRating,
      comment,
      product: product.docId,
      author: Auth.currentUser.email,
    });
    try {
      let reviewList;
      const label = Util.disableButton(e.target.submitReview);
      const feedback = await ReviewsController.addReview(review);
      if (feedback) {
        reviewList = await ReviewsController.getReviewList();
        console.log("reviewList: ", reviewList);
      }
      Util.enableButton(e.target.submitReview, label);
      e.target.reset();
      Element.modalReview.hide();
      reviewList.forEach((item) => {
        const li = document.createElement("li");
        // add delete event listener
        li.querySelector(".delete__review").addEventListener("click", () => {
          confirm("Are you sure you want to delete this review?");
        });

        // edit delete event listener
        li.querySelector(".edit__review").addEventListener("click", () => {
          Element.modalReview.show();
        });
        li.classList.add("review__item");
        const reviewItem = Element.templateReviewItem.cloneNode(true).content;
        reviewItem.querySelector(".review__item__name").textContent =
          item.author;
        reviewItem.querySelector(".review__item__date").textContent =
          item.timestamp;
        reviewItem.querySelector(".review__item__text").textContent =
          item.comment;
        li.appendChild(reviewItem);
      });
    } catch (error) {
      console.log("feebackerror: ", error);
    }
  });
}
