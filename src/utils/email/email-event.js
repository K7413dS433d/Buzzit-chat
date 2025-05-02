import EventEmitter from "events";
import { sendEmail } from "./send-email.js";
import {
  acceptanceTemplate,
  otpTemplate,
  rejectionTemplate,
} from "./template-generator.js";

export const emailEmitter = new EventEmitter();

emailEmitter.on("sendEmail", async ({ email, otp }) => {
  await sendEmail({
    to: email,
    html: otpTemplate(otp),
  });
});

emailEmitter.on("accept", async ({ email, username, jobTitle }) => {
  await sendEmail({
    to: email,
    subject: `Congratulations, ${username}! Welcome to ${process.env.ORG_NAME} `,
    text: acceptanceTemplate(username, jobTitle),
  });
});

emailEmitter.on("reject", async ({ email, username, jobTitle }) => {
  await sendEmail({
    to: email,
    subject: `Update on Your Application for ${jobTitle}`,
    text: rejectionTemplate(username, jobTitle),
  });
});
