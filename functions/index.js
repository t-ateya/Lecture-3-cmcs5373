const functions = require("firebase-functions");

const admin = require("firebase-admin");

const serviceAccount = require("./account_key.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const Constant = require('./constant.js')
//cf==cloud function
exports.cf_addProduct = functions.https.onCall(addProduct);
exports.cf_getProductList = functions.https.onCall(getProductList);

function isAdmin(email){
  return Constant.adminEmails.includes(email)
}

async function getProductList(data, context){
  if (!isAdmin(context.auth.token.email)){
    if(Constant.DEV) console.log('not admin', context.auth.token.email);
    throw new functions.https.HttpsError('unauthenticated', 'Only admin may invoke this function')
 }

 try {
   let products = [];
   const snapShot = await admin.firestore().collection(Constant.collectionNames.PRODUCT)
                          .orderBy('name')
                          .get();
  snapShot.forEach(doc =>{
    const {name, price, summary, imageName, imageURL}=doc.data();
    const p = {name, price, summary, imageName, imageURL}
    p.docId = doc.id;
    products.push(p);
  });
  return products;
 } catch (e) {
  if (Constant.DEV)console.log(e)
  throw new functions.https.HttpsError('internal', 'getProduct failed')
 }
}

async function addProduct(data, context){
   if (!isAdmin(context.auth.token.email)){
      if(Constant.DEV) console.log('not admin', context.auth.token.email);
      throw new functions.https.HttpsError('unauthenticated', 'Only admin may invoke this function')
   }
    //data: serialized product object
    try {
        await admin.firestore().collection(Constant.collectionNames.PRODUCT)
                        .add(data);
    } catch (e) {
      if (Constant.DEV)console.log(e)
      throw new functions.https.HttpsError('internal', 'addProduct failed')
    }
}


