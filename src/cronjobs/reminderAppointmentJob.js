import dayjs from "dayjs";
import sendMail from "../utils/SendMail.js";
import Booking from "../models/booking.js";
import PatientRecord from "../models/patient_records.js";
import User from "../models/users.js";
import DoctorInfo from "../models/doctor_info.js";
import Clinic from "../models/clinic.js";
import Allcode from "../models/allcodes.js";
import Specialty from "../models/specialty.js";
import isBetween from "dayjs/plugin/isBetween.js";
dayjs.extend(isBetween);

export async function runReminder1DayJob() {
  // const tomorrow = dayjs().add(1, "day").format("YYYY-MM-DD");
  const tomorrowStart = dayjs().add(1, "day").startOf("day").toDate();
  const tomorrowEnd = dayjs().add(1, "day").endOf("day").toDate();

  const bookings = await Booking.find({
    appointmentDate: {
      $gte: tomorrowStart,
      $lte: tomorrowEnd,
    },
  });

  // console.log("Check booking", bookings)

  for (let booking of bookings) {
    const patientRecordId = booking.patientRecordId;
    const findPatientRecord = await PatientRecord.findOne({
      patientRecordId: patientRecordId,
    });
    const userId = findPatientRecord.patientId;
    const findUser = await User.findOne({ userId: userId });
    // console.log("User email", findUser.email)
    // console.log("Patient email", findPatientRecord.email)

    const findDoctorInfo = await DoctorInfo.findOne({
      doctorId: booking.doctorId,
    });
    const findClinic = await Clinic.findOne({
      clinicId: findDoctorInfo.clinicId,
    });
    const findTimeRange = await Allcode.findOne({ keyMap: booking.timeType });
    const findDoctorName = await User.findOne({ userId: booking.doctorId });
    const findSpecialtyName = await Specialty.findOne({
      specialtyId: findDoctorInfo.specialtyId,
    });
    const findStatus = await Allcode.findOne({ keyMap: booking.status });

    // gửi về mail
    const subject = "Nhắc lịch khám cho bệnh nhân";
    const bookerName = findUser.fullname;
    const patientName = findPatientRecord.fullname;
    const clinicName = findClinic.name;
    const appointmentDate = booking.appointmentDate.toISOString().split("T")[0];
    const timeRange = findTimeRange.valueVi;
    const doctorName = findDoctorName.fullname;
    const specialtyName = findSpecialtyName.name;
    const reason = booking.reason;
    let price = Number(booking.price).toLocaleString("vi-VN", {
      style: "currency",
      currency: "VND",
    });
    const statusText = findStatus.valueVi;
    const clinicAddress = findClinic.address;
    const clinicMapLink = findClinic.mapUrl;
    const clinicEmail = findClinic.email;
    const orderNumber = booking?.orderNumber || "N/A";
    const paymentStatus = booking?.paymentStatus || "N/A";
    const paymentMethod = booking?.paymentMethod || "N/A";

    const datas = {
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
      orderNumber,
      paymentMethod,
      paymentStatus,
    };

    await sendMail.sendMailReminder(findUser.email, datas, subject);
  }
}

export async function runReminder3DayJob() {
  // const tomorrow = dayjs().add(1, "day").format("YYYY-MM-DD");
  const start = dayjs().add(3, "day").startOf("day").toDate();
  const end = dayjs().add(3, "day").endOf("day").toDate();

  const bookings = await Booking.find({
    appointmentDate: {
      $gte: start,
      $lte: end,
    },
  });

  // console.log("Check booking", bookings)

  for (let booking of bookings) {
    const patientRecordId = booking.patientRecordId;
    const findPatientRecord = await PatientRecord.findOne({
      patientRecordId: patientRecordId,
    });
    const userId = findPatientRecord.patientId;
    const findUser = await User.findOne({ userId: userId });
    // console.log("User email", findUser.email)
    // console.log("Patient email", findPatientRecord.email)

    const findDoctorInfo = await DoctorInfo.findOne({
      doctorId: booking.doctorId,
    });
    const findClinic = await Clinic.findOne({
      clinicId: findDoctorInfo.clinicId,
    });
    const findTimeRange = await Allcode.findOne({ keyMap: booking.timeType });
    const findDoctorName = await User.findOne({ userId: booking.doctorId });
    const findSpecialtyName = await Specialty.findOne({
      specialtyId: findDoctorInfo.specialtyId,
    });
    const findStatus = await Allcode.findOne({ keyMap: booking.status });

    // gửi về mail
    const subject = "Nhắc lịch khám cho bệnh nhân";
    const bookerName = findUser.fullname;
    const patientName = findPatientRecord.fullname;
    const clinicName = findClinic.name;
    const appointmentDate = booking.appointmentDate.toISOString().split("T")[0];
    const timeRange = findTimeRange.valueVi;
    const doctorName = findDoctorName.fullname;
    const specialtyName = findSpecialtyName.name;
    const reason = booking.reason;
    let price = Number(booking.price).toLocaleString("vi-VN", {
      style: "currency",
      currency: "VND",
    });
    const statusText = findStatus.valueVi;
    const clinicAddress = findClinic.address;
    const clinicMapLink = findClinic.mapUrl;
    const clinicEmail = findClinic.email;
    const orderNumber = booking?.orderNumber || "N/A";
    const paymentStatus = booking?.paymentStatus || "N/A";
    const paymentMethod = booking?.paymentMethod || "N/A";

    const datas = {
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
      orderNumber,
      paymentMethod,
      paymentStatus,
    };

    await sendMail.sendMailReminder(findUser.email, datas, subject);
  }
}

export async function runReminder1HourJob() {
  const now = dayjs();
  const oneHourLater = now.add(1, "hour");

  const bookings = await Booking.find({
    appointmentDate: {
      $gte: oneHourLater.startOf("day").toDate(),
      $lte: oneHourLater.endOf("day").toDate(),
    },
  });

  const currentHour = oneHourLater.format("HH:mm");

  for (let booking of bookings) {
    const timeCode = booking.timeType;
    const findTime = await Allcode.findOne({ keyMap: timeCode });
    if (!findTime || !findTime.valueVi.includes(" - ")) continue;

    const [startTimeStr, endTimeStr] = findTime.valueVi.split(" - ");
    const appointmentDateStr = dayjs(booking.appointmentDate).format(
      "YYYY-MM-DD"
    );
    const timeStart = dayjs(
      `${appointmentDateStr} ${startTimeStr}`,
      "YYYY-MM-DD HH:mm"
    );
    const timeEnd = dayjs(
      `${appointmentDateStr} ${endTimeStr}`,
      "YYYY-MM-DD HH:mm"
    );

    if (!oneHourLater.isBetween(timeStart, timeEnd, null, "[)")) continue;

    const patientRecord = await PatientRecord.findOne({
      patientRecordId: booking.patientRecordId,
    });
    const user = await User.findOne({ userId: patientRecord?.patientId });
    const doctorInfo = await DoctorInfo.findOne({ doctorId: booking.doctorId });
    const clinic = await Clinic.findOne({ clinicId: doctorInfo.clinicId });
    const specialty = await Specialty.findOne({
      specialtyId: doctorInfo.specialtyId,
    });
    const doctor = await User.findOne({ userId: booking.doctorId });
    const status = await Allcode.findOne({ keyMap: booking.status });

    const datas = {
      bookerName: user.fullname,
      patientName: patientRecord.fullname,
      clinicName: clinic.name,
      appointmentDate: dayjs(booking.appointmentDate).format("DD/MM/YYYY"),
      appointmentDay: dayjs(booking.appointmentDate).format("dddd"),
      timeRange: findTime.valueVi,
      doctorName: doctor.fullname,
      specialtyName: specialty.name,
      reason: booking.reason,
      price: Number(booking.price).toLocaleString("vi-VN", {
        style: "currency",
        currency: "VND",
      }),
      statusText: status.valueVi,
      clinicAddress: clinic.address,
      clinicMapLink: clinic.mapUrl,
      clinicEmail: clinic.email,
    };

    const subject = "Nhắc lịch khám - Còn 1 tiếng nữa";

    await sendMail.sendMailReminder(user.email, datas, subject);
  }

  console.log("[Cron] Gửi nhắc lịch trước 1 tiếng thành công");
}
