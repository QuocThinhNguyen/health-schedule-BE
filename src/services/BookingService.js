import booking from "../models/booking.js"
import patient_Records from "../models/patient_records.js"
import doctor_Info from "../models/doctor_info.js"
import specialty from "../models/specialty.js"
import clinic from "../models/clinic.js"
import schedules from "../models/schedule.js"
import user from "../models/users.js"
import sendMail from "../utils/sendMail.js";


const getAllBookingByUserId = (userId, startDate, endDate) => {
    return new Promise(async (resolve, reject) => {
      try {
        const patientRecords = await patient_Records.find({ patientId: userId });
        if (patientRecords.length === 0) {
          return {
            status: 404,
            message: "No patient records found for this user",
          };
        }
  
        const bookings = await booking.find({
          patientRecordId: {
            $in: patientRecords.map((record) => record.patientRecordId),
          },
        })
          .populate({
            path: "patientRecordId",
            model: "PatientRecords",
            localField: "patientRecordId",
            foreignField: "patientRecordId",
            select:
              "fullname gender birthDate phoneNumber CCCD email job address patientId ",
          })
          .populate({
            path: "doctorId",
            model: "Users",
            localField: "doctorId",
            foreignField: "userId",
            select: "fullname",
          })
          .populate({
            path: "status",
            model: "AllCodes",
            localField: "status",
            foreignField: "keyMap",
            select: "valueEn valueVi",
          })
          .populate({
            path: "timeType",
            model: "AllCodes",
            localField: "timeType",
            foreignField: "keyMap",
            select: "valueEn valueVi",
          })
  
        if (bookings.length === 0) {
          return {
            status: 404,
            message: "No booking found for this user",
          };
        }
  
        const detailedBookings = await Promise.all(
          bookings.map(async (booking) => {
            const doctorInfo = await doctor_Info.findOne({
              doctorId: booking.doctorId.userId,
            })
              .populate("specialtyId", "name description")
              .populate({
                path: "specialtyId",
                model: "Specialty",
                localField: "specialtyId",
                foreignField: "specialtyId",
                select: "name",
              })
              .populate({
                path: "clinicId",
                model: "Clinic",
                localField: "clinicId",
                foreignField: "clinicId",
                select: "name address",
              });
  
            return {
              ...booking._doc,
              doctorInfo: {
                specialty: doctorInfo?.specialtyId || null,
                clinic: doctorInfo?.clinicId || null,
              },
            };
          })
        );
  
        let result = [];
        if (startDate && endDate) {
          result = detailedBookings.filter((booking) => {
            const appointmentDate = new Date(booking.appointmentDate);
            if (appointmentDate >= startDate && appointmentDate <= endDate)
              return booking;
            else return null;
          });
        } else {
          result = detailedBookings;
        }
  
        result.sort((a, b) => new Date(b.appointmentDate) - new Date(a.appointmentDate));

        resolve({
            status: 200,
            message: "SUCCESS",
            data: result,
        });
      } catch (e) {
        console.error(e);
        reject(e.message);
      }
    });
  };

const getAllBooking = (query) => {
    return new Promise(async (resolve, reject) => {
      try {
        const page = parseInt(query.page) || 1;
        const limit = parseInt(query.limit) || 6;
        let formatQuery = {}
        if (query.date) {
          formatQuery.appointmentDate = {
            $gte: new Date(query.date + "T00:00:00Z"),
            $lt: new Date(query.date + "T23:59:59Z"),
          };
        }
        if (query.status) {
          formatQuery.status = query.status
        }
        // Bộ lọc
        const regex = new RegExp(query.query, 'i');
        //Theo ngày hoặc không
        const totalBookings = await booking.find(formatQuery)
          .populate({
            path: "doctorId",
            model: "Users",
            localField: "doctorId",
            foreignField: "userId",
            select: "fullname email",
          })
          .populate({
            path: "patientRecordId",
            model: "PatientRecords",
            localField: "patientRecordId",
            foreignField: "patientRecordId",
            select: "fullname gender phoneNumber birthDate address",
          }).lean()
        //Tính số lượng filter theo tên bác sĩ hoặc tên bệnh nhân
        const totalFilteredBookings = totalBookings.filter((doctor) => {
          return (
            regex.test(doctor.doctorId?.fullname) ||
            regex.test(doctor.patientRecordId?.fullname)
          );
        }).length;
        //Lấy mảng filter theo tên bác sĩ hoặc tên bệnh nhân
        const filteredBookings = totalBookings.filter((doctor) => {
          return (
            regex.test(doctor.doctorId?.fullname) ||
            regex.test(doctor.patientRecordId?.fullname)
          );
        })
        //sắp xếp tăng dần theo ngày rồi mới phân trang
        const sortedResults = filteredBookings.sort((a, b) => {
          return new Date(a.appointmentDate) - new Date(b.appointmentDate); // Sắp xếp
        }).map(booking => ({
          ...booking,
          appointmentDate: booking.appointmentDate.toISOString().split('T')[0] // Chỉ lấy ngày
        })).slice((page - 1) * limit, page * limit);
  
        const totalPages = Math.ceil(totalFilteredBookings / limit);
  
        resolve({
          status: 200,
          message: "SUCCESS",
          data: sortedResults,
          totalPages
        });
      } catch (e) {
        reject(e);
      }
    });
  };

  const getBooking = (id) => {
    return new Promise(async (resolve, reject) => {
      try {
        const bookingFind = await booking.findOne({
          bookingId: id,
        })
          .populate("doctorId", "fullname email")
          .populate({
            path: "doctorId",
            model: "Users",
            localField: "doctorId",
            foreignField: "userId",
            select: "fullname email",
          })
          .populate({
            path: "patientRecordId",
            model: "PatientRecords",
            localField: "patientRecordId",
            foreignField: "patientRecordId",
            select: "fullname gender phoneNumber birthDate address",
          }).lean()
          const newBooking = {
            ...bookingFind,
            appointmentDate: bookingFind.appointmentDate.toISOString().split('T')[0] // Chỉ lấy ngày
          }
        if (newBooking === null) {
          resolve({
            status: 404,
            message: "The booking is not defined"
          });
        }
        resolve({
          status: 200,
          message: "SUCCESS",
          data: newBooking,
        });
      } catch (e) {
        reject(e.message);
      }
    });
  };

  const createBooking = (data) => {
    return new Promise(async (resolve, reject) => {
      try {
        const newBooking = await booking.create(data);
        resolve({
          status: 200,
          message: "SUCCESS",
          data: newBooking,
        });
      } catch (e) {
        reject(e);
      }
    });
  };

  const updateBooking = (id, data) => {
    return new Promise(async (resolve, reject) => {
      try {
        const checkBooking = await booking.findOne({
          bookingId: id,
        });
        if (checkBooking === null) {
          resolve({
            status: 404,
            message: "The booking is not defined"
          });
        }
  
        if (data.status === "S5") {
          const schedule = await schedules.findOne({
            doctorId: checkBooking.doctorId,
            scheduleDate: checkBooking.appointmentDate.toISOString().split('T')[0],
            timeType: checkBooking.timeType
          });
  
          if (schedule) {
            schedule.currentNumber -= 1;
            await schedule.save();
          }
        }
        const updatedBooking = await booking.findOneAndUpdate(
          { bookingId: id }, // Điều kiện tìm kiếm
          data, // Giá trị cần cập nhật
          { new: true }
        );
        resolve({
          status: 200,
          message: "SUCCESS",
          data: updatedBooking,
        });
      } catch (e) {
        reject(e);
      }
    });
  };

  const getBookingByDoctorId = (doctorId, date) => {
    return new Promise(async (resolve, reject) => {
      try {
        const query = {
          doctorId: doctorId
        };
  
        if (date) {
          const startOfDay = new Date(date);
          startOfDay.setHours(0, 0, 0, 0);
  
          const endOfDay = new Date(date);
          endOfDay.setHours(23, 59, 59, 999);
  
          query.appointmentDate = {
            $gte: startOfDay,
            $lte: endOfDay
          };
        }
        const data = await booking.find(query)
          .populate({
            path: "doctorId",
            model: "Users",
            localField: "doctorId",
            foreignField: "userId",
            select: "fullname",
          })
          .populate({
            path: "patientRecordId",
            model: "PatientRecords",
            localField: "patientRecordId",
            foreignField: "patientRecordId",
            select: "fullname gender birthDate phoneNumber CCCD email job address"
          })
          .populate({
            path: "status",
            model: "AllCodes",
            localField: "status",
            foreignField: "keyMap",
            select: "valueEn valueVi"
          })
          .populate({
            path: "timeType",
            model: "AllCodes",
            localField: "timeType",
            foreignField: "keyMap",
            select: "valueEn valueVi"
          })
        if (data.length === 0) {
          resolve({
            status: 404,
            message: "The booking is not defined",
          });
        } else {
          resolve({
            status: 200,
            message: "SUCCESS",
            data: data,
          });
        }
      } catch (e) {
        reject(e);
      }
    });
  }

  const patientBookingOnline = (data) => {
    return new Promise(async (resolve, reject) => {
      try {
        if (!data.doctorId || !data.patientRecordId || !data.appointmentDate || !data.timeType) {
          resolve({
            status: 400,
            message: "Data is not enough",
          });
        } else {
          const existingBooking = await booking.findOne({
            doctorId: data.doctorId,
            patientRecordId: data.patientRecordId,
            appointmentDate: data.appointmentDate,
            timeType: data.timeType,
            status: "S2" || "S3"
          })
  
          if (existingBooking) {
            resolve({
              status:409,
              message: "Bạn đã đặt khung giờ này !",
            });
          } else {
            const schedule = await schedules.findOne({
              doctorId: data.doctorId,
              scheduleDate: data.appointmentDate,
              timeType: data.timeType
            });
            if (schedule) {
              if (schedule.currentNumber < schedule.maxNumber) {
                // schedule.currentNumber += 1;
                // await schedule.save();
                const newBooking = await booking.create({
                  doctorId: data.doctorId,
                  patientRecordId: data.patientRecordId,
                  appointmentDate: data.appointmentDate,
                  timeType: data.timeType,
                  price: data.price,
                  reason: data.reason || '',
                  status: 'S5'
                })
                await newBooking.save();
  
                resolve({
                  status: 200,
                  message: "SUCCESS",
                  data: newBooking,
                });
              } else {
                resolve({
                  status: 409,
                  message: "This schedule is full",
                });
              }
            } else {
              resolve({
                status: 404,
                message: "This schedule is not existed",
              });
            }
          }
        }
      } catch (e) {
        reject(e)
      }
    })
  }

  const patientBookingDirect = (data) => {
    return new Promise(async (resolve, reject) => {
      try {
        if (!data.doctorId || !data.patientRecordId || !data.appointmentDate || !data.timeType) {
          resolve({
            status: 400,
            message: "Data is not enough",
          });
        } else {
          const existingBooking = await booking.findOne({
            doctorId: data.doctorId,
            patientRecordId: data.patientRecordId,
            appointmentDate: data.appointmentDate,
            timeType: data.timeType,
            status: "S2" || "S3"
          })
          if (existingBooking) {
            resolve({
              status: 409,
              message: "Bạn đã đặt khung giờ này !",
            });
          } else {
            const schedule = await schedules.findOne({
              doctorId: data.doctorId,
              scheduleDate: data.appointmentDate,
              timeType: data.timeType
            });
            if (schedule) {
              if (schedule.currentNumber < schedule.maxNumber) {
                // schedule.currentNumber += 1;
                // await schedule.save();
  
                const newBooking = await booking.create({
                  doctorId: data.doctorId,
                  patientRecordId: data.patientRecordId,
                  appointmentDate: data.appointmentDate,
                  timeType: data.timeType,
                  price: data.price,
                  reason: data.reason || '',
                  status: 'S1'
                })
                await newBooking.save();
                // console.log("IDD", newBooking.bookingId);
                const bookingId = newBooking.bookingId;
                const emailResult = await getEmailByBookingId(bookingId);
                // console.log("KQ", emailResult);
      const {patientEmail, userEmail, namePatient, reason, price,time,nameClinic,nameSpecialty,nameDoctor,nameUser,imageClinic }=emailResult.data;

      const bookingFind = await booking.findOne({
        bookingId: bookingId,
      })
        .populate("doctorId", "fullname email")
        .populate({
          path: "doctorId",
          model: "Users",
          localField: "doctorId",
          foreignField: "userId",
          select: "fullname email userId",
        })
        .populate({
          path: "patientRecordId",
          model: "PatientRecords",
          localField: "patientRecordId",
          foreignField: "patientRecordId",
          select: "fullname gender phoneNumber birthDate",
        });
      const doctorId = bookingFind.doctorId.userId;
      const timeType = bookingFind.timeType;
      const { appointmentDate } = bookingFind;
      const appointmentDateString = appointmentDate.toISOString().split("T")[0]; // Chỉ lấy phần ngày
      const datas = {namePatient, reason, appointmentDateString,price,time,nameClinic,nameSpecialty,nameDoctor,nameUser,imageClinic,bookingId,doctorId,timeType};
      await sendMail.sendMailVerify([patientEmail, userEmail], datas, "Xác nhận đặt khám");

                resolve({
                  status: 200,
                  message: "SUCCESS",
                  data: newBooking,
                });
              } else {
                resolve({
                  status: 409,
                  message: "This schedule is full",
                });
              }
            } else {
              resolve({
                status: 404,
                message: "This schedule is not existed",
              });
            }
          }
        }
      } catch (e) {
        reject(e)
      }
    })
  }

  const updateBookingStatus = (bookingId, status) => {
    return new Promise(async (resolve, reject) => {
      try {
        const bookingFind = await booking.findOne({
          bookingId: bookingId
        });
        if (!bookingFind) {
          resolve({
            status: 404,
            message: "The booking is not defined",
          });
        } else {
          bookingFind.status = status;
          await bookingFind.save();
          await 
          resolve({
            status: 200,
            message: "SUCCESS",
            data: bookingFind
          });
        }
      } catch (e) {
        reject(e)
      }
    })
  }

  const updateBookingPaymentUrl = async (bookingId, paymentUrl) => {
    return new Promise(async (resolve, reject) => {
      try {
        const bookingFind = await booking.findOneAndUpdate(
          { bookingId: bookingId },
          { paymentUrl: paymentUrl },
          { new: true }
        );
  
        if (!bookingFind) {
          return resolve({
            status: 404,
            message: "Booking not found",
          });
        }
  
        resolve({
          status: 200,
          message: "Payment URL updated successfully",
          data: booking,
        });
      } catch (e) {
        reject({
          status: 500,
          message: "Error from server",
          error: e.message,
        });
      }
    });
  };

const getEmailByBookingId = async(bookingId)=>{
  return new Promise(async (resolve, reject) => {
    try{
      const bookingFind = await booking.findOne({
        bookingId: bookingId
      })
      .populate({
        path: "patientRecordId",
        model: "PatientRecords",
        localField: "patientRecordId",
        foreignField: "patientRecordId",
        select: "email patientId fullname"
      })
      .populate({
        path:"timeType",
        model:"AllCodes",
        localField:"timeType",
        foreignField:"keyMap",
        select:"valueEn valueVi"
      })
      .populate({
        path:"doctorId",
        model:"DoctorInfo",
        localField:"doctorId",
        foreignField:"doctorId",
        select:"doctorId clinicId specialtyId position" 
      })
  
      if (!bookingFind || !bookingFind.patientRecordId){
        return {
          status: 404,
          message: "The booking is not defined"
        }
      }
  
      const patientRecordEmail = bookingFind.patientRecordId.email;
      const patientId = bookingFind.patientRecordId.patientId;
      const clinicId = bookingFind.doctorId.clinicId;
      const specialtyId = bookingFind.doctorId.specialtyId;
      const doctorId = bookingFind.doctorId.doctorId;

      const clinicFind = await clinic.findOne({
        clinicId: clinicId
      },"name image");
    
      const specialtyFind = await specialty.findOne({
        specialtyId: specialtyId
      },"name")

      const doctorFind = await user.findOne({
        userId: doctorId
      },"fullname")
  
      const userFind = await user.findOne({
        userId: patientId
      },"email fullname");
  
      resolve({
        status: 200,
        message: "SUCCESS",
        data: {
          patientEmail: patientRecordEmail,
          userEmail: userFind.email,
          namePatient: bookingFind.patientRecordId.fullname,
          reason:bookingFind.reason,
          appointmentDate: bookingFind.appointmentDate,
          price: bookingFind.price,
          time: bookingFind.timeType.valueVi,
          nameClinic: clinicFind.name,
          nameSpecialty: specialtyFind.name,
          nameDoctor: doctorFind.fullname,
          nameUser: userFind.fullname,
          imageClinic: clinicFind.image,
          timeKey: bookingFind.timeType.keyMap
        }
      });
  
    }catch(e){
      reject({
        status: 500,
        message: "Error from server",
        error: e.message
      })
    }
  })
}

const confirmBooking= async({bookingId,doctorId,appointmentDate,timeType})=>{
  return new Promise(async (resolve, reject) => {
  try{
    await updateBookingStatus(bookingId,"S2");
     // Tìm lịch trình của bác sĩ
     const schedule = await schedules.findOne({
      doctorId,
      scheduleDate: appointmentDate,
      timeType,
  });

  if (!schedule) {
      throw new Error('Schedule not found!');
  }

  // Cập nhật số lượng đặt lịch hiện tại
  schedule.currentNumber += 1;
  await schedule.save();
  const emailResult = await getEmailByBookingId(bookingId);
      const {patientEmail, userEmail, namePatient, reason, price,time,nameClinic,nameSpecialty,nameDoctor,nameUser,imageClinic }=emailResult.data;
      const appointmentDateString = appointmentDate;
      // console.log("DATEEEE",appointmentDate)
      const button ="Đã xác nhận"
      const datas = {namePatient, reason, appointmentDateString,price,time,nameClinic,nameSpecialty,nameDoctor,nameUser,imageClinic,button};
      // console.log("DATAS",datas)

  await sendMail.sendMailSuccess([patientEmail, userEmail], datas, "Xác nhận đặt lịch khám thành công");

  resolve({
      status: 200,
      message: 'Booking confirmed successfully',
  });

  }catch(e){
    reject({
      status: 500,
      message: e.message,
      error: e.message
    })
  }
})
}

  export default {
    getAllBookingByUserId,
    getAllBooking,
    getBooking,
    createBooking,
    updateBooking,
    getBookingByDoctorId,
    patientBookingOnline,
    patientBookingDirect,
    updateBookingStatus,
    updateBookingPaymentUrl,
    getEmailByBookingId,
    confirmBooking
  }