const nodemailer = require('nodemailer')

const getTransportConfig = () => {
  const { EMAIL_HOST, EMAIL_PORT, EMAIL_SECURE, EMAIL_USER, EMAIL_PASS } = process.env

  if (!EMAIL_HOST || !EMAIL_PORT || !EMAIL_USER || !EMAIL_PASS) {
    throw new Error('Email service is not configured')
  }

  return {
    host: EMAIL_HOST,
    port: Number(EMAIL_PORT),
    secure: EMAIL_SECURE === 'true',
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASS,
    },
  }
}

const sendResetPasswordEmail = async (email, resetUrl) => {
  try {
    const transporter = nodemailer.createTransport(getTransportConfig())
    const from = process.env.EMAIL_FROM || process.env.EMAIL_USER

    await transporter.sendMail({
      from,
      to: email,
      subject: 'Reset your TaskFlow password',
      text: `Reset your TaskFlow password using this link: ${resetUrl}\n\nThis link expires in 1 hour. If you did not request a password reset, you can ignore this email.`,
      html: `
        <div style="margin:0;padding:0;background:#0f172a;font-family:Arial,Helvetica,sans-serif;color:#e5e7eb;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding:32px 16px;background:#0f172a;">
            <tr>
              <td align="center">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#111827;border:1px solid #1f2937;border-radius:12px;overflow:hidden;">
                  <tr>
                    <td style="padding:28px 28px 12px;">
                      <h1 style="margin:0;color:#f9fafb;font-size:24px;line-height:32px;">Reset your TaskFlow password</h1>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:0 28px 20px;color:#cbd5e1;font-size:15px;line-height:24px;">
                      We received a request to reset your password. Use the button below to create a new password.
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:0 28px 24px;">
                      <a href="${resetUrl}" style="display:inline-block;background:#2563eb;color:#ffffff;text-decoration:none;font-weight:700;font-size:15px;padding:12px 18px;border-radius:8px;">
                        Reset password
                      </a>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:0 28px 24px;color:#94a3b8;font-size:13px;line-height:20px;">
                      This link expires in 1 hour. If you did not request a password reset, you can safely ignore this email.
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:20px 28px;background:#0b1120;color:#64748b;font-size:12px;line-height:18px;">
                      If the button does not work, copy and paste this link into your browser:<br />
                      <a href="${resetUrl}" style="color:#93c5fd;word-break:break-all;">${resetUrl}</a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </div>
      `,
    })

    return { success: true }
  } catch (error) {
    console.error('Failed to send reset password email:', error.message)
    return {
      success: false,
      message: error.message || 'Failed to send reset password email',
    }
  }
}

module.exports = sendResetPasswordEmail
