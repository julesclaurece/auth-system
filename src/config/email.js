const https = require('https');

const sendEmail = async ({ to, subject, html }) => {
  const payload = JSON.stringify({
    sender: { name: process.env.EMAIL_FROM_NAME, email: process.env.EMAIL_FROM },
    to: [{ email: to }],
    subject,
    htmlContent: html,
  });

  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: 'api.brevo.com',
        path: '/v3/smtp/email',
        method: 'POST',
        headers: {
          'api-key': process.env.BREVO_API_KEY,
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload),
        },
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) resolve(data);
          else reject(new Error(`Brevo API error ${res.statusCode}: ${data}`));
        });
      }
    );
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
};

module.exports = { sendEmail };
