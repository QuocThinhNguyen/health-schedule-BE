import bookingMedia from "../models/booking_media.js";

const getAllBookingImageByBookingId = async (bookingId) => {
  return new Promise(async (resolve, reject) => {
    try {
        const data = await bookingMedia.find({
          bookingId: bookingId
        })
        if (!data) {
            resolve({
                status: 404,
                message: "Clinic is not defined"
            })
        }
        resolve({
            status: 200,
            message: "Get clinic successfully",
            data: data
        })
    } catch (e) {
        reject(e)
    }
})
}
export default {
  getAllBookingImageByBookingId
};