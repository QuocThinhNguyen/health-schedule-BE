import bookingService from "../services/BookingService.js"
import paymentService from "../services/PaymentService.js"

const getAllBookingByUserId = async (req, res) => {
    try {
      const startDate = req.query.startDate;
      const endDate = req.query.endDate;
      const userId = req.body.userId;
    if (!userId) {
        // userId is required
        return res.status(404).json({
            status:404,
            message:"User Id is required"
        })
    }
    const response = await bookingService.getAllBookingByUserId(userId, startDate, endDate);
    return res.status(200).json(response);
    } catch (error) {
        return res.status(500).json({
            status: 500,
            message: "Error from server"
        })
    }
  }

  const getAllBooking = async (req, res) => {
    try {
      const data = await bookingService.getAllBooking(req.query);
      return res.status(200).json(data);
    } catch (e) {
      return res.status(500).json({
        status: 500,
        message: "Error from server"
      });
    }
  };

  const getBooking = async (req, res) => {
    try {
      const bookingId = req.params.id;
  
      if (!bookingId) {
        return res.status(404).json({
          status: 404,
          message: "bookingId is required",
        });
      }
      const response = await bookingService.getBooking(bookingId);
      return res.status(200).json(response);
    } catch (e) {
      return res.status(500).json({
        status: 500,
        message: e
      });
    }
  };

  const createBooking = async (req, res) => {
    try {
      const data = req.body;
      const response = await bookingService.createBooking(data);
      return res.status(200).json(response);
    } catch (e) {
      return res.status(404).json({
        status: 404,
        message: e
      });
    }
  };

  const updateBooking = async (req, res) => {
    try {
      const bookingId = req.params.id;
      const data = req.body;
      if (!bookingId) {
        return res.status(404).json({
          status: 404,
          message: "The bookingId is required",
        });
      }
      const response = await bookingService.updateBooking(bookingId, data);
      return res.status(200).json(response);
    } catch (e) {
      return res.status(500).json({
        status: 500,
        message: e
      });
    }
  };

  const getBookingByDoctorId = async (req, res) => {
    try {
      const { doctorId } = req.params;
      const { date } = req.query; // Lấy tham số ngày từ query string
  
      const result = await bookingService.getBookingByDoctorId(doctorId, date);
      return res.status(200).json(result);
    } catch (e) {
      // console.log(e);
      return res.status(500).json({
        status: 500,
        message: "Error from server",
      });
    }
  }

  const patientBookingOnline = async (req, res) => {
    try {
      const data = req.body;
      const result = await bookingService.patientBookingOnline(data);
      if (result.status === 200) {
        // console.log("IDDDD:", result.data.bookingId, typeof result.data.bookingId.toString());
  
        const paymentUrl = await paymentService.createPaymentUrl(result.data.bookingId.toString(), result.data.price, 'Payment for booking');
        return res.status(200).json({
          status: 200,
          message: "Booking created successfully",
          paymentUrl: paymentUrl
        });
      } else {
        return res.status(400).json(result);
      }
    } catch (e) {
      // console.log(e);
      return res.status(500).json({
        status: 500,
        message: e.message,
      });
    }
  };

  const patientBookingDirect = async (req, res) => {
    try {
      const data = req.body;
      const result = await bookingService.patientBookingDirect(data);
      if (result.status === 200) {  
        return res.status(200).json({
          status: 200,
          message: "Booking created successfully",
        });
      } else {
        return res.status(400).json(result);
      }
    } catch (e) {
      return res.status(500).json({
        status: 500,
        message: e.message
      });
    }
  };

  const handlePaymentReturn = async (req, res) => {
    return paymentService.handlePaymentReturn(req, res);
  };

const getEmailByBookingId = async(req,res)=>{
  try{
    const bookingId = req.params.bookingId;
    const response = await bookingService.getEmailByBookingId(bookingId);
    return res.status(200).json(response);
  }catch(e){
    return res.status(500).json({
      status: 500,
      message: "Error from server"
    });
}
}

const confirmBooking = async (req, res) => {
  try{
    const { bookingId, doctorId, appointmentDate, timeType } = req.query;
    const response = await bookingService.confirmBooking({bookingId, doctorId, appointmentDate, timeType});
    return res.redirect(`http://localhost:${process.env.FE_PORT}/`);
  }catch(e){
    return res.status(500).json({
      status: 500,
      message: e.message
    });
  }
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
    handlePaymentReturn,
    getEmailByBookingId,
    confirmBooking
  }