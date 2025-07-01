const express = require("express");
const multer = require("multer");
const nodemailer = require("nodemailer");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000;

// ثابت: بيانات البريد (ثابتة)
const senderEmail = process.env.EMAIL_USER;
const senderPass = process.env.EMAIL_PASS;

 // كلمة مرور تطبيق Gmail

// إعداد رفع الملفات
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads"),
  filename: (req, file, cb) => cb(null, file.originalname)
});
const upload = multer({ storage: storage });

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

function isValidEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

app.post("/send", upload.single("cvfile"), async (req, res) => {
  const { subject, message, recipients } = req.body;
  const allEmails = recipients.split(/[\n,]+/).map(e => e.trim()).filter(e => e);
  const validEmails = allEmails.filter(isValidEmail);

  if (!validEmails.length) return res.send("❌ لم يتم العثور على أي بريد إلكتروني صالح.");

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: senderEmail, pass: senderPass }
  });

  const results = [];

  for (const email of validEmails) {
    const mailOptions = {
      from: senderEmail,
      to: email,
      subject: subject,
      text: message,
      attachments: req.file
        ? [{ filename: req.file.originalname, path: req.file.path }]
        : []
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log(`✅ تم الإرسال إلى: ${email}`);
      results.push(`✅ ${email}`);
    } catch (error) {
      console.error(`❌ فشل الإرسال إلى ${email}:`, error.message);
      results.push(`❌ ${email}`);
    }
  }

  // حذف الملف بعد الإرسال
  if (req.file) fs.unlinkSync(req.file.path);

  res.send(`تمت عملية الإرسال:\n${results.join("\n")}`);
});

app.listen(PORT, () =>
  console.log(`🚀 Server started on http://localhost:${PORT}`)
);
