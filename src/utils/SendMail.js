import nodemailer from "nodemailer";

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
    text,
  });

  return info;
};

const sendMailResetPassword = async (email, resetLink, subject) => {
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
    html: `
    <p>Để đặt lại mật khẩu của bạn, vui lòng nhấp vào liên kết dưới đây. Sau khi nhấp vào liên kết, chúng tôi sẽ gửi mật khẩu mới đến email này.</p>
    <a href="${resetLink}">Đặt lại mật khẩu của bạn</a>
  `,
  });

  return info;
};

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
  let {
    namePatient,
    reason,
    appointment,
    appointmentDateString,
    price,
    time,
    nameClinic,
    nameSpecialty,
    nameDoctor,
    nameUser,
    imageClinic,
    button,
    clinicAddress,
    clinicMapLink,
  } = data;
  let priceInVND = Number(price).toLocaleString("vi-VN", {
    style: "currency",
    currency: "VND",
  });

  // send mail with defined transport object
  const info = await transporter.sendMail({
    from: '"EasyMed" <no-reply@easymed.com>', // sender address
    to: recipientList, // list of receivers
    subject, // Subject line
    html: `
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
                <img src="${imageClinic}" alt="Barcode" width="100" height="100">
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
                    <span class="label">Bác sĩ:</span>
                    <span class="value">${nameDoctor}</span>
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
              <div class="info-row">
                    <span class="label">Địa điểm:</span>
                    <span class="value">${clinicAddress}</span>
                </div>
              <div class="info-row">
                    <span class="label">Xem bản đồ:</span>
                    <span class="value"><a href="${clinicMapLink}" target="_blank">Google Maps</a></span>
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
        path: imageClinic, // Đường dẫn ảnh trong máy cục bộ
        cid: "imageClinic", // Content ID để tham chiếu trong HTML
      },
    ],
  });
  return info;
};

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
  let {
    namePatient,
    reason,
    appointmentDateString,
    price,
    time,
    nameClinic,
    nameSpecialty,
    nameDoctor,
    nameUser,
    imageClinic,
    bookingId,
    doctorId,
    timeType,
  } = data;
  let priceInVND = Number(price).toLocaleString("vi-VN", {
    style: "currency",
    currency: "VND",
  });

  const webLink = process.env.WEB_LINK;
  // send mail with defined transport object
  const info = await transporter.sendMail({
    from: '"EasyMed" <no-reply@easymed.com>',
    to: recipientList,
    subject,
    html: `
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
                <img src=${imageClinic} alt="Barcode" width="100" height="100">
            </div>
            <a href="${webLink}/booking/confirmBooking?bookingId=${bookingId}&doctorId=${doctorId}&appointmentDate=${appointmentDateString}&timeType=${timeType}" style="text-decoration: none;">
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
        path: imageClinic, // Đường dẫn ảnh trong máy cục bộ
        cid: "imageClinic", // Content ID để tham chiếu trong HTML
      },
    ],
  });
  return info;
};

const sendMailReminder = async (email, data, subject) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // true for port 465, false for other ports
    auth: {
      user: process.env.EMAIL_NAME,
      pass: process.env.EMAIL_APP_PASSWORD,
    },
  });

  let {
    bookerName,
    patientName,
    clinicName,
    appointmentDate,
    timeRange,
    doctorName,
    specialtyName,
    reason,
    price,
    statusText,
    clinicAddress,
    clinicMapLink,
    clinicEmail,
  } = data;

  const info = await transporter.sendMail({
    from: '"EasyMed" <no-reply@easymed.com>',
    to: email,
    subject,
    html: `
    <div style="font-family: Arial, sans-serif; color: #333; padding: 16px; line-height: 1.6;">
    <h2 style="color: #2e7d32;">🔔 Thông báo lịch khám bệnh</h2>

    <p>Xin chào <strong>${bookerName}</strong>,</p>

    <p>Bạn đã đặt lịch khám bệnh cho bệnh nhân <strong>${patientName}</strong> tại <strong>${clinicName}</strong>.</p>

    <p><strong>Thông tin lịch khám:</strong></p>
    <ul>
      <li><strong>Ngày khám:</strong> ${appointmentDate}</li>
      <li><strong>Giờ khám:</strong> ${timeRange}</li>
      <li><strong>Bác sĩ:</strong> ${doctorName}</li>
      <li><strong>Chuyên khoa:</strong> ${specialtyName}</li>
      <li><strong>Lý do khám:</strong> ${reason}</li>
      <li><strong>Chi phí khám:</strong> ${price} VND</li>
      <li><strong>Trạng thái:</strong> ${statusText}</li>
      <li><strong>Địa điểm:</strong> ${clinicAddress}</li>
      <li><strong>Xem bản đồ:</strong> <a href="${clinicMapLink}" target="_blank">Google Maps</a></li>
    </ul>

    <p>📌 Vui lòng đảm bảo bệnh nhân đến đúng giờ. Nên đến trước <strong>15 phút</strong> để được hỗ trợ tốt nhất.</p>

    <p>Nếu bạn cần hỗ trợ hoặc muốn thay đổi lịch khám, vui lòng liên hệ:</p>
    <ul>
      <li>📞 Số điện thoại: 19002115</li>
      <li>✉️ Email: ${clinicEmail}</li>
    </ul>

    <p>Trân trọng,</p>
    <p><strong>Đội ngũ EasyMed</strong></p>
  </div>
    `,
  });
  return info;
};

export default {
  sendMail,
  sendMailSuccess,
  sendMailVerify,
  sendMailResetPassword,
  sendMailReminder,
};
