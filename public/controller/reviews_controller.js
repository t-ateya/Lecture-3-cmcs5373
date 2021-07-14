import * as Constant from "../model/constant.js";
import {
    Review
} from "../model/Review.js";

export async function addReview(data) {
    try {
        data.timestamp = firebase.firestore.FieldValue.serverTimestamp();
        const ref = await firebase
            .firestore()
            .collection(Constant.collectionNames.REVIEWS)
            .add(data);
        return ref;
    } catch (error) {
        if (Constant.DeV) {
            console.log(error);
        }
    }

}

export async function editReview(data) {
    try {
        const snapShots = await firebase.firestore()
            .collection(Constant.collectionNames.REVIEWS)
            .where('product', '==', data.product)
            .get();

        let ref;
        snapShots.forEach(doc => {
            ref = doc.id;
        });

        await firebase.firestore()
            .collection(Constant.collectionNames.REVIEWS)
            .doc(ref).update(data);
    } catch (error) {
        if (Constant.DeV) {
            console.log(error);
        }
    }
}

export async function getReviewList() {
    try {
        let reviewList = [];
        // const selectedProduct = JSON.parse(localStorage.getItem('product'));

        // .where('product', '==', selectedProduct.docId)
        const snapShot = await firebase.firestore().collection(Constant.collectionNames.REVIEWS)
            .orderBy('timestamp', 'desc')
            .get();
        snapShot.forEach((doc) => {
            const review = doc.data();
            review.docId = doc.id;
            reviewList.push(review);
        });
        return reviewList;
    } catch (error) {
        if (Constant.DeV) {
            console.log("getReviewList error!", error);
        }
    }
}

export async function deleteReview(docId) {
    try {
        await firebase.firestore()
            .collection(Constant.collectionNames.REVIEWS)
            .doc(docId)
            .delete();
        return console.log('ok');
    } catch (error) {
        console.log('delete review error: ', error);
    }
}

export function getAverageRating(reviewList, selectedProduct) {
    const numberOfReviews = reviewList.filter(r => r.product === selectedProduct.docId);
    const totalStars = numberOfReviews.reduce((sum, review) => Number(review.stars) + sum, 0);
    const averageRating = numberOfReviews.length > 0 ? Math.ceil(totalStars / numberOfReviews.length) : 0;
    return averageRating;
}

export function getProductReviewList(reviewList, product) {
    return reviewList.filter(review => review.product === product.docId);
}