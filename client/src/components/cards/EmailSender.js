// EmailSender.js

import axios from "axios";

export const sendEmail = async (emailData, authToken) => {
  try {
    await axios.post("/send-email", emailData, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });
    console.log("Email sent successfully");
  } catch (err) {
    console.log("Error sending email", err);
    if (err.code === 'EAUTH' && err.command === 'AUTH XOAUTH2') {
      console.log('Invalid or expired tokens. Check out your aws config');
    }
  }
};
