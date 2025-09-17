"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchUser = fetchUser;
exports.getUserByPhone = getUserByPhone;
exports.setUser = setUser;
const firestore_1 = require("firebase-admin/firestore");
const db = (0, firestore_1.getFirestore)();
const usersRef = db.collection("users");
async function fetchUser(phone) {
    const user = await getUserByPhone(phone);
    if (user)
        return user;
    // Se não encontrar, cria um novo
    const docRef = await usersRef.add({
        phone,
        createdAt: firestore_1.Timestamp.now(),
        lastSeen: firestore_1.Timestamp.now(),
    });
    return {
        id: docRef.id,
        phone,
        createdAt: firestore_1.Timestamp.now(),
        lastSeen: firestore_1.Timestamp.now(),
    };
}
async function getUserByPhone(phone) {
    const snapshot = await usersRef.where("phone", "==", phone).limit(1).get();
    if (snapshot.empty)
        return null;
    const doc = snapshot.docs[0];
    return Object.assign({ id: doc.id }, doc.data());
}
async function setUser(userId, userData) {
    const user = Object.assign(Object.assign({}, userData), { lastSeen: firestore_1.Timestamp.now() });
    await usersRef.doc(userId).set(user, { merge: true });
}
//# sourceMappingURL=userService.js.map