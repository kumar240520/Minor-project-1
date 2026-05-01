require('dotenv').config({ path: require('path').resolve(__dirname, './.env') });
const nodemailer = require('nodemailer');

console.log("=========================================");
console.log("TESTING SMTP CREDENTIALS");
console.log("=========================================");
console.log("Loaded SMTP_USER:", process.env.SMTP_USER);
const pass = process.env.SMTP_PASS;
console.log("Loaded SMTP_PASS:", pass ? pass.substring(0, 3) + "***" + pass.substring(pass.length - 2) : "UNDEFINED");

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // MUST be true for port 465
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

transporter.verify(function (error, success) {
    if (error) {
        console.error("\n❌ CONNECTION REJECTED BY GOOGLE:");
        console.error(error.message);
        process.exit(1);
    } else {
        console.log("\n✅ SUCCESS! Google accepted the connection and credentials.");
        console.log("The backend will now work perfectly.");
        
        // Let's send a test email!
        transporter.sendMail({
            from: process.env.EMAIL_FROM,
            to: process.env.SMTP_USER,
            subject: "EduSure SMTP Test Success!",
            text: "If you are reading this, your Google SMTP configuration is completely validated and perfectly functioning!"
        }).then(() => {
            console.log("✅ Test email sent to", process.env.SMTP_USER);
            process.exit(0);
        }).catch(err => {
            console.error("❌ Auth succeeded, but failed to send:", err.message);
            process.exit(1);
        });
    }
});
