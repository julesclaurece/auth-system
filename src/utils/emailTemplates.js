const verificationEmail = (name, url) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
    <h2>Welcome, ${name}!</h2>
    <p>Please verify your email address by clicking the button below.</p>
    <a href="${url}" style="display:inline-block;padding:12px 24px;background:#4F46E5;color:#fff;border-radius:6px;text-decoration:none;">
      Verify Email
    </a>
    <p style="color:#888;font-size:12px;margin-top:24px;">This link expires in 24 hours.</p>
  </div>
`;

const resetPasswordEmail = (name, url) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
    <h2>Password Reset Request</h2>
    <p>Hi ${name}, we received a request to reset your password.</p>
    <a href="${url}" style="display:inline-block;padding:12px 24px;background:#DC2626;color:#fff;border-radius:6px;text-decoration:none;">
      Reset Password
    </a>
    <p style="color:#888;font-size:12px;margin-top:24px;">This link expires in 1 hour. If you didn't request this, ignore this email.</p>
  </div>
`;

module.exports = { verificationEmail, resetPasswordEmail };
