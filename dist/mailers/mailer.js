"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = void 0;
const app_config_1 = require("../config/app.config");
const resendClient_1 = require("./resendClient");
const mailer_sender = app_config_1.config.NODE_ENV === 'development'
    ? `no-reply <onboarding@resend.dev>`
    : `TheStock <${app_config_1.config.MAILER_SENDER}>`;
const sendEmail = async ({ to, from = mailer_sender, subject, text, html, }) => await resendClient_1.resend.emails.send({
    from,
    to: Array.isArray(to) ? to : [to],
    text,
    subject,
    html,
});
exports.sendEmail = sendEmail;
