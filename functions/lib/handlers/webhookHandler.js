"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.webhook = void 0;
const twilioService_1 = require("../services/twilioService");
const router_1 = require("../bot/router");
const https_1 = require("firebase-functions/v2/https");
const userService_1 = require("../services/userService");
// Função webhook
exports.webhook = (0, https_1.onRequest)({ timeoutSeconds: 1200 }, async (req, res) => {
    var _a, _b;
    if (req.method !== "POST") {
        res.status(405).send("Only POST");
        return;
    }
    const userMessage = ((_a = req.body.Body) !== null && _a !== void 0 ? _a : "");
    const from = ((_b = req.body.From) !== null && _b !== void 0 ? _b : "");
    const user = await (0, userService_1.fetchUser)(from);
    const reply = await (0, router_1.route)(user, userMessage);
    await (0, twilioService_1.sendMessage)(from, reply);
    res.status(200).end();
});
//# sourceMappingURL=webhookHandler.js.map