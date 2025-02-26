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
            select: "fullname gender phoneNumber birthDate address CCCD email job",
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

  // const getBookingByDoctorId = (doctorId, date) => {
  //   return new Promise(async (resolve, reject) => {
  //     try {
  //       const query = {
  //         doctorId: doctorId
  //       };
  
  //       if (date) {
  //         const startOfDay = new Date(date);
  //         startOfDay.setHours(0, 0, 0, 0);
  
  //         const endOfDay = new Date(date);
  //         endOfDay.setHours(23, 59, 59, 999);
  
  //         query.appointmentDate = {
  //           $gte: startOfDay,
  //           $lte: endOfDay
  //         };
  //       }
  //       const data = await booking.find(query)
  //         .populate({
  //           path: "doctorId",
  //           model: "Users",
  //           localField: "doctorId",
  //           foreignField: "userId",
  //           select: "fullname",
  //         })
  //         .populate({
  //           path: "patientRecordId",
  //           model: "PatientRecords",
  //           localField: "patientRecordId",
  //           foreignField: "patientRecordId",
  //           select: "fullname gender birthDate phoneNumber CCCD email job address"
  //         })
  //         .populate({
  //           path: "status",
  //           model: "AllCodes",
  //           localField: "status",
  //           foreignField: "keyMap",
  //           select: "valueEn valueVi"
  //         })
  //         .populate({
  //           path: "timeType",
  //           model: "AllCodes",
  //           localField: "timeType",
  //           foreignField: "keyMap",
  //           select: "valueEn valueVi"
  //         })
  //       if (data.length === 0) {
  //         resolve({
  //           status: 404,
  //           message: "The booking is not defined",
  //         });
  //       } else {
  //         const totalPatients = new Set(data.map(b => b.patientRecordId?.toString())).size;
  //         const totalBooking = data.length;

  //         resolve({
  //           status: 200,
  //           message: "SUCCESS",
  //           data: data,
  //           totalPatients,
  //           totalBooking
  //         });
  //       }
  //     } catch (e) {
  //       reject(e);
  //     }
  //   });
  // }

const getBookingByDoctorId = (doctorId, date, page = 1, limit = 1000, search) => {
  return new Promise(async (resolve, reject) => {
    try {
      const query = { doctorId };

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

      // Chuyển page & limit sang kiểu số nguyên
      page = parseInt(page) || 1;
      limit = parseInt(limit) || 10;
      if (page < 1) page = 1; // Đảm bảo page không nhỏ hơn 1

      // Lấy danh sách booking có phân trang
      const bookings = await booking.find(query)
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
        .sort({ appointmentDate: -1 }) // Sắp xếp giảm dần theo ngày đặt lịch
        .lean(); // Sử dụng lean() để chuyển đổi kết quả sang đối tượng JavaScript thuần

        // console.log("Bookings", bookings);
        // const totalPatients = new Set(bookings.map(b => b.patientRecordId?.CCCD?.toString())).size;
        const totalPatients = bookings.length;

        // Tính tổng số bệnh nhân trong 1 tuần
        const startOfWeek = new Date();
        const day = startOfWeek.getDay();
        const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // Điều chỉnh để bắt đầu từ Thứ Hai
        startOfWeek.setDate(diff);
        startOfWeek.setHours(0, 0, 0, 0);
        // console.log("Check 1:", startOfWeek);
        
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(endOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);
        // console.log("Check 2:", endOfWeek);

      const weeklyBookings = await booking.find({
        doctorId,
        appointmentDate: {
          $gt: startOfWeek,
          $lte: endOfWeek
        }
      }).populate({
        path: "patientRecordId",
        model: "PatientRecords",
        localField: "patientRecordId",
        foreignField: "patientRecordId",
        select: "CCCD"
      }).lean();

      // const totalPatientsInWeek = new Set(weeklyBookings.map(b => b.patientRecordId?.CCCD?.toString())).size;
      const totalPatientsInWeek = weeklyBookings.length;

      console.log("Total patients in week", totalPatientsInWeek);

      // Tính tổng số bệnh nhân trong tuần trước
      const startOfLastWeek = new Date(startOfWeek);
      startOfLastWeek.setDate(startOfLastWeek.getDate() - 7);
      // console.log("Start of last week", startOfLastWeek);

      const endOfLastWeek = new Date(startOfWeek);
      endOfLastWeek.setDate(endOfLastWeek.getDate() - 1);
      endOfLastWeek.setHours(23, 59, 59, 999);
      // console.log("End of last week", endOfLastWeek);

      const lastWeekBookings = await booking.find({
        doctorId,
        appointmentDate: {
          $gt: startOfLastWeek,
          $lte: endOfLastWeek
        }
      }).populate({
        path: "patientRecordId",
        model: "PatientRecords",
        localField: "patientRecordId",
        foreignField: "patientRecordId",
        select: "CCCD"
      }).lean();

      // console.log("Last week bookings", lastWeekBookings);

      // const totalPatientsLastWeek = new Set(lastWeekBookings.map(b => b.patientRecordId?.CCCD?.toString())).size;
      const totalPatientsLastWeek = lastWeekBookings.length;

      console.log("Total patients last week", totalPatientsLastWeek);

      // Tính tổng số booking trong tháng này
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);
      // console.log("Start of month", startOfMonth);

      const endOfMonth = new Date(startOfMonth);
      endOfMonth.setMonth(endOfMonth.getMonth() + 1);
      endOfMonth.setDate(0);
      endOfMonth.setHours(23, 59, 59, 999);
      // console.log("End of month", endOfMonth);

      const monthlyBookings = await booking.find({
        doctorId,
        appointmentDate: {
          $gt: startOfMonth,
          $lte: endOfMonth
        }
      }).lean();

      const totalBookingThisMonth = monthlyBookings.length;

      // Tính tổng số booking trong tháng trước
      const startOfLastMonth = new Date(startOfMonth);
      startOfLastMonth.setMonth(startOfLastMonth.getMonth() - 1);
      // console.log("Start of last month", startOfLastMonth);

      const endOfLastMonth = new Date(startOfMonth);
      endOfLastMonth.setDate(0);
      endOfLastMonth.setHours(23, 59, 59, 999);
      // console.log("End of last month", endOfLastMonth);

      const lastMonthBookings = await booking.find({
        doctorId,
        appointmentDate: {
          $gt: startOfLastMonth,
          $lte: endOfLastMonth
        }
      }).lean();

      const totalBookingLastMonth = lastMonthBookings.length;

      // Tìm kiếm với $regex
      let filteredBookings = bookings;
      if (search) {
        const regex = new RegExp(search, 'i');
        // console.log("Regex", regex);
        // console.log("FILTER:",filteredBookings)
        filteredBookings = bookings.filter((booking) => {
          return (
            regex.test(booking.patientRecordId?.fullname) ||
            regex.test(booking.patientRecordId?.phoneNumber) ||
            regex.test(booking.patientRecordId?.CCCD)
          );
        });
      }

      console.log("Filered bookings", filteredBookings);

      // Phân trang kết quả
      const totalBooking = filteredBookings.length;
      const totalPages = Math.ceil(totalBooking / limit);
      const paginatedBookings = filteredBookings.slice((page - 1) * limit, page * limit);

      resolve({
        status: 200,
        message: "SUCCESS",
        data: paginatedBookings,
        totalPatients,
        totalBooking,
        totalPages,
        totalPatientsInWeek,
        totalPatientsLastWeek,
        totalBookingThisMonth,
        totalBookingLastMonth
      });
      // if (paginatedBookings.length === 0) {
      //   resolve({
      //     status: 404,
      //     message: "No bookings found",
      //     totalBooking: 0,
      //     totalPatients: 0,
      //     totalPages: 0,
      //     data: [],
      //   });
      // } else {
      //   resolve({
      //     status: 200,
      //     message: "SUCCESS",
      //     data: paginatedBookings,
      //     totalPatients,
      //     totalBooking,
      //     totalPages,
      //     totalPatientsInWeek,
      //     totalPatientsLastWeek,
      //     totalBookingThisMonth,
      //     totalBookingLastMonth
      //   });
      // }
    } catch (e) {
      reject(e);
    }
  });
};

const getBookingLatestByDoctorId = async (doctorId, date, page = 1, limit = 10, search) => {
  return new Promise(async (resolve, reject) => {
    try {
      const query = { doctorId };

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

      if (search) {
        query.$or = [
          { "patientRecordId.fullname": { $regex: search, $options: "i" } }, // Tìm theo tên
          { "patientRecordId.phoneNumber": { $regex: search, $options: "i" } }, // Tìm theo số điện thoại
          { "patientRecordId.CCCD": { $regex: search, $options: "i" } }, // Tìm theo CCCD
        ];
      }


      // Chuyển page & limit sang kiểu số nguyên
      page = parseInt(page) || 1;
      limit = parseInt(limit) || 10;
      if (page < 1) page = 1; // Đảm bảo page không nhỏ hơn 1

      // Lấy danh sách booking có phân trang
      const bookings = await booking.find(query)
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
        .sort({ appointmentDate: -1 }) // Sắp xếp giảm dần theo ngày đặt lịch
        .skip((page - 1) * limit)
        .limit(limit);


        
      // Tính tổng số lượng booking
      const totalBooking = await booking.countDocuments(query);
      const totalPages = Math.ceil(totalBooking / limit);

      if (bookings.length === 0) {
        resolve({
          status: 404,
          message: "No bookings found",
          totalBooking: 0,
          totalPatients: 0,
          totalPages: 0,
          data: [],
        });
      } else {
        // Đếm số lượng bệnh nhân duy nhất
        const totalPatients = new Set(bookings.map(b => b.patientRecordId?.toString())).size;

        resolve({
          status: 200,
          message: "SUCCESS",
          data: bookings,
          totalPatients,
          totalBooking,
          totalPages,
        });
      }
    } catch (e) {
      reject(e);
    }
  });
};

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
                  status: 'S1',
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
    confirmBooking,
    getBookingLatestByDoctorId
  }