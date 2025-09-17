"use strict";
// Envio de mensagens e validações
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendMessage = sendMessage;
const twilio_1 = require("twilio");
const env_1 = require("../config/env");
const client = new twilio_1.Twilio(env_1.env.TWILIO_SID, env_1.env.TWILIO_AUTH);
async function sendMessage(to, body) {
    await client.messages.create({
        from: env_1.env.TWILIO_FROM,
        to,
        body,
    });
}
//# sourceMappingURL=twilioService.js.map