import BookingImageService from "../services/BookingImageService.js";

const getAllBookingImageByBookingId = async (req, res) => {
   try {
          const id = req.params.id;
          const data = await BookingImageService.getAllBookingImageByBookingId(id);
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
