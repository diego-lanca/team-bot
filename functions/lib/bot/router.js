"use strict";
// Roteamento de mensagens
Object.defineProperty(exports, "__esModule", { value: true });
exports.route = route;
const date_fns_1 = require("date-fns");
const firestoreService_1 = require("../services/firestoreService");
const greetings_1 = require("./flows/greetings");
const welcome_1 = require("./flows/welcome");
const askName_1 = require("./flows/askName");
async function route(user, msg) {
    const session = await (0, firestoreService_1.getSession)(user.id);
    if (!session)
        return (0, welcome_1.welcome)();
    if (session.step == 'ask_name') {
        console.log((0, askName_1.askName)(msg));
    }
    const daysDiff = (0, date_fns_1.differenceInDays)(new Date(), session.updatedAt.toDate());
    if (daysDiff > 0) {
        return (0, greetings_1.greetings)();
    }
    return 'Desculpa, não entendi. Digite "ajuda" para opções.';
}
//# sourceMappingURL=router.js.map