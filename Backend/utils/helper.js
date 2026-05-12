const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('../config/config.js')

const verifyPassword = async (pass1, pass2) => {
    const response = await bcrypt.compare(pass1, pass2);
    return response;
}

const hashPassword = async (pass, salt=10) => {
    const hashedPass = await bcrypt.hash(pass, salt);
    return hashedPass;
}

const generateToken = (payload) => {
    const token = jwt.sign(payload, config.JWT_SECRET, {expiresIn: '1h'});
    return token;
}

const verifyToken = (token) => {
    const data = jwt.verify(token, config.JWT_SECRET);
    return data;
}

// both included
const generateRandom = (start, end) => {
    const no = Math.floor(Math.random() * end) + start;
    return no;
}

const generateOTP = () => {
    const otp = Math.floor(100000 + Math.random() * 900000);
    return otp.toString();
}

const getOTPHTML = (otp) => {
  return `
    <div style="
      margin: 0;
      padding: 0;
      background-color: #f4f4f7;
      font-family: Arial, sans-serif;
    ">
      <table
        width="100%"
        cellpadding="0"
        cellspacing="0"
        style="padding: 40px 0;"
      >
        <tr>
          <td align="center">
            <table
              width="500"
              cellpadding="0"
              cellspacing="0"
              style="
                background-color: #ffffff;
                border-radius: 12px;
                padding: 40px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.08);
              "
            >
              <!-- Logo / Brand -->
              <tr>
                <td align="center">
                  <h1 style="
                    margin: 0;
                    color: #111827;
                    font-size: 28px;
                  ">
                    Ink Rider
                  </h1>

                  <p style="
                    margin-top: 8px;
                    color: #6b7280;
                    font-size: 14px;
                  ">
                    Email Verification
                  </p>
                </td>
              </tr>

              <!-- Spacer -->
              <tr>
                <td height="30"></td>
              </tr>

              <!-- Heading -->
              <tr>
                <td align="center">
                  <h2 style="
                    margin: 0;
                    color: #111827;
                    font-size: 24px;
                  ">
                    Verify your email address
                  </h2>
                </td>
              </tr>

              <!-- Description -->
              <tr>
                <td align="center">
                  <p style="
                    margin-top: 16px;
                    color: #4b5563;
                    font-size: 16px;
                    line-height: 24px;
                  ">
                    Use the OTP below to complete your signup process.
                    This OTP is valid for the next 10 minutes.
                  </p>
                </td>
              </tr>

              <!-- OTP Box -->
              <tr>
                <td align="center">
                  <div style="
                    margin: 30px 0;
                    display: inline-block;
                    background-color: #f3f4f6;
                    padding: 16px 32px;
                    border-radius: 10px;
                    letter-spacing: 8px;
                    font-size: 32px;
                    font-weight: bold;
                    color: #2563eb;
                  ">
                    ${otp}
                  </div>
                </td>
              </tr>

              <!-- Security Note -->
              <tr>
                <td align="center">
                  <p style="
                    color: #6b7280;
                    font-size: 14px;
                    line-height: 22px;
                  ">
                    If you did not request this email, you can safely ignore it.
                  </p>
                </td>
              </tr>

              <!-- Divider -->
              <tr>
                <td>
                  <hr style="
                    border: none;
                    border-top: 1px solid #e5e7eb;
                    margin: 30px 0;
                  ">
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td align="center">
                  <p style="
                    margin: 0;
                    color: #9ca3af;
                    font-size: 12px;
                    line-height: 20px;
                  ">
                    © ${new Date().getFullYear()} Ink Rider. All rights reserved.
                  </p>

                  <p style="
                    margin-top: 8px;
                    color: #9ca3af;
                    font-size: 12px;
                  ">
                    This is an automated message. Please do not reply.
                  </p>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </div>
  `;
};

module.exports = {
    verifyPassword,
    hashPassword,
    generateToken,
    verifyToken,
    generateRandom,
    generateOTP,
    getOTPHTML
}