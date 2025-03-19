const twilio = require('twilio');
require("dotenv").config();

const client = new twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

const sendSMS = async (to, message) => {
    const response = await client.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to,
    });

    console.log("SMS sent:", response.sid);
    return response;
};

module.exports = { sendSMS };