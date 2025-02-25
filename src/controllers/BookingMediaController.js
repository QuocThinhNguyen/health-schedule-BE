import BookingMediaService from "../services/BookingMediaService.js";

const getAllBookingImageByBookingId = async (req, res) => {
   try {
          const id = req.params.id;
          const data = await BookingMediaService.getAllBookingImageByBookingId(id);
          return res.status(200).json(data)
      } catch (err) {
          return res.status(500).json({
              status: 500,
              message: "Error from server"
          })
      }
}
export default {
  getAllBookingImageByBookingId
};
