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
            .add(data.serialize());
        return ref;
    } catch (error) {
        if (Constant.DeV) {
            console.log(error);
        }
    }

}

export async function editReview(data) {
    try {
        data.timestamp = firebase.firestore.FieldValue.serverTimestamp();
        const snapShot = await firebase.firestore()
            .collection(Constant.collectionNames.REVIEWS)
            .where('product', '==', data.product);

        const updatedData = new Review(data);

        const ref = await firebase.firestore()
            .collection(Constant.collectionNames.REVIEWS)
            .doc(snapShot.ref).update(data.serialize());

        return ref.docId;

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
            .orderBy('timestamp')
            .get();
        snapShot.forEach((doc) => {
            const review = doc.data();
            review.docId = doc.docId;
            reviewList.push(review);

        });
        return reviewList;
    } catch (error) {
        if (Constant.DeV) {
            console.log("getReviewList error!", error);
        }
    }
}