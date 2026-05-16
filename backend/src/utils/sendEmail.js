// આ ફાઈલમાંથી ઉપર nodemailer વાળો ઈમ્પોર્ટ જ કાઢી નાખ્યો છે, એની હવે જરૂર નથી

export const sendEmail = async (to, subject, otp) => {
    try {
        const apiKey = process.env.BREVO_API_KEY;
        const senderEmail = process.env.BREVO_USER || "payalkacha06@gmail.com";

        // જો કી Render પર લોડ નહીં થઈ હોય તો આ લોગ આપણને ડેશબોર્ડ પર એલર્ટ આપશે
        if (!apiKey) {
            console.log("❌ EMAIL FAILED: BREVO_API_KEY is missing in env");
            return false;
        }

        // Brevo ની સત્તાવાર v3 API માટેનો ડેટા પેલોડ
        const emailData = {
            sender: { name: "Cartify", email: senderEmail },
            to: [{ email: to }],
            subject: subject || "Cartify OTP Verification",
            htmlContent: `
        <div style="
          max-width:420px;
          margin:auto;
          font-family:Arial, sans-serif;
          text-align:center;
          padding:25px;
          border:1px solid #eee;
          border-radius:10px;
          box-shadow: 0 4px 6px rgba(0,0,0,0.05);
        ">
          <h2 style="color:#4f46e5; margin-bottom:10px;">Cartify Verification</h2>
          <p style="color:#6b7280;font-size:14px; margin-top:0;">
            Use this OTP to verify your account
          </p>
          <div style="
            margin:20px 0;
            font-size:28px;
            letter-spacing:8px;
            font-weight:bold;
            color:#111827;
            background:#eef2ff;
            padding:12px;
            border-radius:8px;
          ">
            ${otp}
          </div>
          <p style="font-size:12px;color:#ef4444; font-weight:500;">
            ⚠️ Valid for 10 minutes only
          </p>
          <hr style="margin:20px 0;border:none;border-top:1px solid #eee;" />
          <p style="font-size:11px;color:#9ca3af;">
            If this wasn't you, ignore this email.
          </p>
        </div>
      `,
        };

        // સીધી HTTPS રિક્વેસ્ટ (પોર્ટ 443 પર જાય એટલે Render આને ક્યારેય બ્લોક નહીં કરી શકે)
        const response = await fetch("https://api.brevo.com/v3/smtp/email", {
            method: "POST",
            headers: {
                "accept": "application/json",
                "api-key": apiKey,
                "content-type": "application/json"
            },
            body: JSON.stringify(emailData)
        });

        const responseData = await response.json();

        if (response.ok) {
            console.log("✅ EMAIL SENT SUCCESSFULLY VIA API:", responseData.messageId);
            return true;
        } else {
            console.log("❌ BREVO API ERROR DETAILS:", responseData);
            return false;
        }
    } catch (err) {
        console.log("❌ EMAIL FAILED ERROR:", err.message);
        return false;
    }
};