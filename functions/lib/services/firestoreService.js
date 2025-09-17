"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSession = getSession;
exports.setSession = setSession;
const firestore_1 = require("firebase-admin/firestore");
async function getSession(userId) {
    // Obtenha a instância do Firestore e a referência da coleção
    const db = (0, firestore_1.getFirestore)();
    const sessionsRef = db.collection("sessions");
    const doc = await sessionsRef.doc(userId).get();
    return doc.exists ? doc.data() : null;
}
async function setSession(userId, session) {
    const db = (0, firestore_1.getFirestore)();
    const sessionsRef = db.collection("sessions");
    await sessionsRef.doc(userId).set(Object.assign(Object.assign({}, session), { updatedAt: firestore_1.Timestamp.now() }), { merge: true });
}
//# sourceMappingURL=firestoreService.js.map