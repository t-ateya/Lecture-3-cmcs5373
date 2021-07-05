* get user * /
const cf_getUser = firebase.functions().httpsCallable("cf_getUser");
export async function getUser(id) {
    const result = await cf_getUser(id);
    return result.data;
}

const cf_updateUser = firebase.functions().httpsCallable("cf_updateUser");
export async function updateUser(uid, update) {
    await cf_updateUser({
        uid,
        update
    });
}


const cf_deleteUser = firebase.functions().httpsCallable("cf_deleteUser");
export async function deleteUser(uid) {
    await cf_deleteUser(uid);
}

const cf_addUser = firebase.functions().httpsCallable("cf_addUser");
export async function addUser(userData) {
    const userRef = await cf_addUser(userData);
    return userRef;
}