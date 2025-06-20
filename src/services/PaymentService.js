import crypto from "crypto";
import axios from "axios";
import momoConfig from "../configs/momoConfig.js";
import bookingService from "../services/BookingService.js";
import Schedules from "../models/schedule.js";
import Booking from "../models/booking.js";
import serviceSchedule from "../models/service_schedule.js";
import sendMail from "../utils/SendMail.js";
import OrderCounter from "../models/order_counter.js";
import OrderCounterService from "./OrderCounterService.js";

const createPaymentUrl = async (bookingId, amount, orderInfo) => {
  const requestId = bookingId + "_" + new Date().getTime();
  const orderId = bookingId + "_" + new Date().getTime();
  const requestType = momoConfig.requestType;
  const redirectUrl = momoConfig.redirectUrl;
  const ipnUrl = momoConfig.ipnUrl;
  const extraData = ""; // Pass empty value if your merchant does not have stores

  // const rawSignature = `accessKey=${momoConfig.accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${momoConfig.partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${requestType}`;
  // const signature = crypto.createHmac('sha256', momoConfig.secretKey).update(rawSignature).digest('hex');

  const rawSignature =
    "accessKey=" +
    momoConfig.accessKey +
    "&amount=" +
    amount +
    "&extraData=" +
    extraData +
    "&ipnUrl=" +
    ipnUrl +
    "&orderId=" +
    orderId +
    "&orderInfo=" +
    orderInfo +
    "&partnerCode=" +
    momoConfig.partnerCode +
    "&redirectUrl=" +
    redirectUrl +
    "&requestId=" +
    requestId +
    "&requestType=" +
    requestType;

  var signature = crypto
    .createHmac("sha256", momoConfig.secretKey)
    .update(rawSignature)
    .digest("hex");

  const requestBody = {
    partnerCode: momoConfig.partnerCode,
    partnerName: "Test",
    storeId: "MomoTestStore",
    requestId: requestId,
    amount: amount,
    orderId: orderId,
    orderInfo: orderInfo,
    redirectUrl: redirectUrl,
    ipnUrl: ipnUrl,
    lang: "vi",
    requestType: requestType,
    autoCapture: true,
    extraData: extraData,
    orderGroupId: "",
    signature: signature,
  };

  try {
    const response = await axios.post(momoConfig.endpoint, requestBody, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    // console.log("Payment URL:", response);
    // const bookingId = response.data.requestId.split('_')[0];
    // await bookingService.updateBookingStatus(bookingId, "S2");
    const bookingIdFromRequestId = response.data.requestId.split("_")[0];
    await bookingService.updateBookingPaymentUrl(
      bookingIdFromRequestId,
      response.data.payUrl
    );
    return response.data.payUrl;
  } catch (error) {
    console.error(
      "Error creating payment URL:",
      error.response ? error.response.data : error.message
    );
    throw error;
  }
};
const handlePaymentReturn = async (req, res) => {
  try {
    // console.log("QUERYYYYY", req.query);
    const { orderId, resultCode } = req.query;
    const bookingId = orderId.split("_")[0];

    if (resultCode === "0") {
      // Thanh toán thành công
      
      // await bookingService.updateBookingStatus(bookingId, "S3");
      // const booking = await bookingService.getBooking(bookingId);
      const bookingDetails = await Booking.findOne({
        bookingId: bookingId,
      });
      console.log("bookingDetails", bookingDetails);
      
      // Chỉ lấy phần ngày
      const orderNumber = await OrderCounterService.generateOrderNumber(
        bookingDetails?.doctorId,
        bookingDetails?.appointmentDate,
        bookingDetails?.bookingType
      );
      console.log("Order number:", orderNumber);
const { doctorId, appointmentDate, timeType } = bookingDetails;
      const appointmentDateString = appointmentDate.toISOString().split("T")[0]; 
      
      await Booking.updateOne(
        { bookingId: bookingId },
        { status: "S3", paymentStatus: "PAID", orderNumber: orderNumber },
        { new: true }
      );

      const emailResult = await bookingService.getEmailByBookingId(bookingId);
      const {
        patientEmail,
        userEmail,
        namePatient,
        reason,
        price,
        time,
        nameClinic,
        nameSpecialty,
        nameDoctor,
        nameUser,
        imageClinic,
        clinicAddress,
        clinicMapLink,
        paymentStatus,
        paymentMethod,
      } = emailResult.data;

      // const booking = await Booking.findOne({
      //   bookingId: bookingId,
      // })
      //   .populate("doctorId", "fullname email")
      //   .populate({
      //     path: "doctorId",
      //     model: "Users",
      //     localField: "doctorId",
      //     foreignField: "userId",
      //     select: "fullname email",
      //   })
      //   .populate({
      //     path: "patientRecordId",
      //     model: "PatientRecords",
      //     localField: "patientRecordId",
      //     foreignField: "patientRecordId",
      //     select: "fullname gender phoneNumber birthDate",
      //   });
      // const { doctorId, appointmentDate, timeType } = bookingDetails;

      const button = "Đã thanh toán";
      const data = {
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
        button,
        clinicAddress,
        clinicMapLink,
        paymentStatus,
        paymentMethod,
        orderNumber,
      };

      const schedule = await Schedules.findOne({
        doctorId: doctorId,
        scheduleDate: appointmentDate,
        timeType: timeType,
      });
      console.log("Schedule handle payment return:", schedule);

      schedule.currentNumber += 1;
      await schedule.save();
      await sendMail.sendMailSuccess(
        [patientEmail, userEmail],
        data,
        "Đặt lịch khám thành công"
      );
      return res.redirect(`${process.env.URL_REACT}/`);
    } else {
      // Thanh toán thất bại
      // await bookingService.updateBookingStatus(bookingId, "S5");
      await Booking.updateOne(
        { bookingId: bookingId },
        { status: "S5", paymentStatus: "FAILED" },
        { new: true }
      );
      return res.status(400).json({
        status: "ERR",
        message: "Payment failed",
      });
    }
  } catch (error) {
    console.error("Error handling payment return:", error.message);
    return res.status(500).json({
      status: "ERR",
      message: "Error from server",
    });
  }
};

const handlePaymentReturnService = async (req, res) => {
  try {
    const { orderId, resultCode } = req.query;
    const bookingId = orderId.split("_")[0];

    if (resultCode === "0") {
      const orderNumber = await bookingService.getOrderNumberByBookingId(
        bookingId
      );
      await booking.updateOne(
        { bookingId: bookingId },
        { status: "S3", paymentStatus: "PAID", orderNumber: orderNumber },
        { new: true }
      );

      const emailResult = await bookingService.getInfoToSendMailSerice(
        bookingId
      );
      const appointmentDateString = emailResult?.appointmentDate
        .toISOString()
        .split("T")[0]; // Chỉ lấy phần ngày
      const button = "Đã thanh toán";
      const data = {
        ...emailResult,
        appointmentDateString,
        button,
      };

      await sendMail.sendMailSuccess(
        [emailResult?.patientEmail, emailResult?.userEmail],
        data,
        "Đặt lịch khám thành công"
      );
      return res.redirect(`${process.env.URL_REACT}/`);
    } else {
      await Booking.updateOne(
        { bookingId: bookingId },
        { status: "S5", paymentStatus: "FAILED" },
        { new: true }
      );
      const schedule = await serviceSchedule.findOne({
        serviceId: serviceId,
        scheduleDate: appointmentDate,
        timeType: timeType,
      });
      if (!schedule) {
        return res.status(404).json({
          status: "ERR",
          message: "Schedule not found",
        });
      }
      if (schedule.currentNumber <= 0) {
        return res.status(400).json({
          status: "ERR",
          message: "No available slots",
        });
      }
      schedule.currentNumber -= 1;
      await schedule.save();
      return res.status(400).json({
        status: "ERR",
        message: "Payment failed",
      });
    }
  } catch (error) {
    console.error("Error handling payment return:", error.message);
    return res.status(500).json({
      status: "ERR",
      message: "Error from server",
    });
  }
};

export default {
  createPaymentUrl,
  handlePaymentReturn,
  handlePaymentReturnService,
};
