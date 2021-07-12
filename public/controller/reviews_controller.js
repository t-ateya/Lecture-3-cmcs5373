import * as Constant from "../model/constant.js";

export async function addReview(data) {
    data.timestamp = firebase.firestore.FieldValue.serverTimestamp();
  try {
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

export async function getReviewList(){
    try {
        let reviewList = [];
        
       const snapShot =  await firebase.firestore().collection(Constant.collectionNames.REVIEWS)
                        .orderBy('timestamp')
                        .get();
    snapShot.forEach((doc) => {
        const review = doc.data();
        review.docId = doc.docId;
        reviewList.push(review);

    });
        return reviewList;
    } catch (error) {
        if (Constant.DeV){
            console.log("getReviewList error!", error)
        }
    }
}

