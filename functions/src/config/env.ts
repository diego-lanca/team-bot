export const env = {
  TWILIO_SID: process.env.TWILIO_SID ?? "",
  TWILIO_AUTH: process.env.TWILIO_AUTH ?? "",
  TWILIO_FROM: process.env.TWILIO_FROM ?? "whatsapp:+55",
  TWILIO_MESSAGE_SID: process.env.TWILIO_MESSAGE_SID ?? "",
  OPENAI_KEY: process.env.OPENAI_KEY ?? "",
  GENERATE_TRAIN_TEXT: process.env.GENERATE_TRAIN_TEXT ?? "",
  GENERATE_HOME_TRAIN_TEXT: process.env.GENERATE_HOME_TRAIN_TEXT ?? "",
  TEAMBOT_LOGO_URL: process.env.TEAMBOT_LOGO_URL ?? "",
  KIWIFY_SECRET: process.env.KIWIFY_SECRET ?? "",
};
