import nodemailer from 'nodemailer'

const sendMail = async (email, text, subject) => {
    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false, // true for port 465, false for other ports
        auth: {
            user: process.env.EMAIL_NAME,
            pass: process.env.EMAIL_APP_PASSWORD,
        },
    });

    // send mail with defined transport object
    const info = await transporter.sendMail({
        from: '"EasyMed" <no-reply@easymed.com>', // sender address
        to: email, // list of receivers
        subject, // Subject line
        text
    });

    return info
}

const sendMailSuccess = async (emails, data, subject) => {
    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false, // true for port 465, false for other ports
        auth: {
            user: process.env.EMAIL_NAME,
            pass: process.env.EMAIL_APP_PASSWORD,
        },
    });

    const recipientList = Array.isArray(emails) ? emails.join(",") : emails;
    let { namePatient, reason, appointment,appointmentDateString,price,time,nameClinic,nameSpecialty,nameDoctor,nameUser,imageClinic,button }=data;
    let priceInVND = Number(price).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });

    // console.log("Data:", data);
    // console.log("VND", priceInVND);

    // send mail with defined transport object
    const info = await transporter.sendMail({
        from: '"EasyMed" <no-reply@easymed.com>', // sender address
        to: recipientList, // list of receivers
        subject, // Subject line
        html:`
        <!DOCTYPE html>
<html lang="vi">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Phiếu Khám Bệnh</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            background-color: #f0f0f0;
            /* Màu nền toàn màn hình */
            padding: 0;
            height: 100vh;
            /* Chiếm toàn bộ chiều cao màn hình */
        }

        .container {
            width: 100%;
            
        }

        .card {
            background-color: #e6f7f2;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            padding: 20px;
            width: 300px;
            margin: 0 auto;
            border: 1px solid #3b82f6;
        }

        .logo {
            text-align: center;
            margin-bottom: 10px;
        }

        .title {
            text-align: center;
            font-weight: bold;
            margin-bottom: 15px;
        }

        .barcode {
            text-align: center;
            margin-bottom: 15px;
        }

        .info {
            margin-bottom: 15px;
            margin-top: 15px;
            position: relative;
        }

        .info-row {
            margin-bottom: 5px;
        }

        .label {
            color: #666;
        }

        .value {
            font-weight: bold;
            float: right;
        }

        .text-4xl {
            font-size: 1.5rem;
        }

        .font-bold {
            font-weight: bold;
        }

        .text-green-500 {
            color: #22c55e;
        }

        .text-blue-500 {
            color: #3b82f6;
        }

        .button {
            padding: 10px;
            width: 45%;
            border: none;
            border-radius: 4px;
            margin: 0 auto;
            display: block;
        }

        .button-verify {
            background-color: #22c55e;
            color: white;
        }
    </style>
</head>

<body>
    <div class="container">
        <div class="card">
            <div class="logo">
                <span class="text-4xl font-bold">
                    <span class="text-green-500">Easy</span>
                    <span class="text-blue-500">Med</span>
                </span>
            </div>
            <div class="title">PHIẾU KHÁM BỆNH</div>
            <div class="barcode">
                <img src="cid:imageClinic" alt="Barcode" width="100" height="100">
            </div>
            <div class="buttons">
                <button class="button button-verify">${button}</button>
            </div>
            <div class="info">
                <div class="info-row">
                    <span class="label">Bệnh viện:</span>
                    <span class="value">${nameClinic}</span>
                </div>
                <div class="info-row">
                    <span class="label">Chuyên khoa:</span>
                    <span class="value">${nameSpecialty}</span>
                </div>
                <div class="info-row">
                    <span class="label">Ngày khám:</span>
                    <span class="value">${appointmentDateString}</span>
                </div>
                <div class="info-row">
                    <span class="label">Giờ khám:</span>
                    <span class="value">${time}</span>
                </div>
                <div class="info-row">
                    <span class="label">Giá tiền:</span>
                    <span class="value">${priceInVND}</span>
                </div>
                <div class="info-row">
                    <span class="label">Họ và tên:</span>
                    <span class="value">${namePatient}</span>
                </div>
                <div class="info-row">
                    <span class="label">Lý do khám:</span>
                    <span class="value">${reason}</span>
                </div>
            </div>
        </div>
    </div>
</body>

</html>
`,
attachments: [
    {
        filename: imageClinic, // Tên file
        path: `http://localhost:9000/uploads/${imageClinic}`, // Đường dẫn ảnh trong máy cục bộ
        cid: 'imageClinic', // Content ID để tham chiếu trong HTML
    },
],
    });

    return info
}

const sendMailVerify = async (emails, data, subject) => {
    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false, // true for port 465, false for other ports
        auth: {
            user: process.env.EMAIL_NAME,
            pass: process.env.EMAIL_APP_PASSWORD,
        },
    });

    const recipientList = Array.isArray(emails) ? emails.join(",") : emails;
    let { namePatient, reason,appointmentDateString,price,time,nameClinic,nameSpecialty,nameDoctor,nameUser,imageClinic,bookingId,doctorId,timeType }=data;
    console.log("Dataaaa:", data);
    let priceInVND = Number(price).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });

    // send mail with defined transport object
    const info = await transporter.sendMail({
        from: '"EasyMed" <no-reply@easymed.com>', // sender address
        to: recipientList, // list of receivers
        subject, // Subject line
        html:`
       <!DOCTYPE html>
<html lang="vi">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Phiếu Khám Bệnh</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            background-color: #f0f0f0;
            /* Màu nền toàn màn hình */
            padding: 0;
            height: 100vh;
            /* Chiếm toàn bộ chiều cao màn hình */
        }

        .container {
            width: 100%;
            
        }

        .card {
            background-color: #e6f7f2;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            padding: 20px;
            width: 300px;
            margin: 0 auto;
            border: 1px solid #3b82f6;
        }

        .logo {
            text-align: center;
            margin-bottom: 10px;
        }

        .title {
            text-align: center;
            font-weight: bold;
            margin-bottom: 15px;
        }

        .barcode {
            text-align: center;
            margin-bottom: 15px;
        }

        .info {
            margin-bottom: 15px;
            margin-top: 15px;
            position: relative;
        }

        .info-row {
            margin-bottom: 5px;
        }

        .label {
            color: #666;
        }

        .value {
            font-weight: bold;
            float: right;
        }

        .text-4xl {
            font-size: 1.5rem;
        }

        .font-bold {
            font-weight: bold;
        }

        .text-green-500 {
            color: #22c55e;
        }

        .text-blue-500 {
            color: #3b82f6;
        }

        .button {
            padding: 10px;
            width: 45%;
            border: none;
            border-radius: 4px;
            margin: 0 auto;
            display: block;
        }

        .button-verify {
            background-color: #22c55e;
            color: white;
            cursor: pointer;
        }
        .button-verify:hover {
            background-color: #16a34a; /* Màu khi hover */
}
    </style>
</head>

<body>
    <div class="container">
        <div class="card">
            <div class="logo">
                <span class="text-4xl font-bold">
                    <span class="text-green-500">Easy</span>
                    <span class="text-blue-500">Med</span>
                </span>
            </div>
            <div class="title">PHIẾU KHÁM BỆNH</div>
            <div class="barcode">
                <img src="cid:imageClinic" alt="Barcode" width="100" height="100">
            </div>
            <a href="http://localhost:9000/booking/confirmBooking?bookingId=${bookingId}&doctorId=${doctorId}&appointmentDate=${appointmentDateString}&timeType=${timeType}" style="text-decoration: none;">
                <button class="button button-verify">Xác nhận</button>
            </a>
            <div class="info">
                <div class="info-row">
                    <span class="label">Bệnh viện:</span>
                    <span class="value">${nameClinic}</span>
                </div>
                <div class="info-row">
                    <span class="label">Chuyên khoa:</span>
                    <span class="value">${nameSpecialty}</span>
                </div>
                <div class="info-row">
                    <span class="label">Ngày khám:</span>
                    <span class="value">${appointmentDateString}</span>
                </div>
                <div class="info-row">
                    <span class="label">Giờ khám:</span>
                    <span class="value">${time}</span>
                </div>
                <div class="info-row">
                    <span class="label">Giá tiền:</span>
                    <span class="value">${priceInVND}</span>
                </div>
                <div class="info-row">
                    <span class="label">Họ và tên:</span>
                    <span class="value">${namePatient}</span>
                </div>
                <div class="info-row">
                    <span class="label">Lý do khám:</span>
                    <span class="value">${reason}</span>
                </div>
            </div>
        </div>
    </div>
</body>

</html>
`,
attachments: [
    {
        filename: imageClinic, // Tên file
        path: `http://localhost:9000/uploads/${imageClinic}`, // Đường dẫn ảnh trong máy cục bộ
        cid: 'imageClinic', // Content ID để tham chiếu trong HTML
    },
],
    });

    return info
}

export default {
    sendMail,
    sendMailSuccess,
    sendMailVerify
}