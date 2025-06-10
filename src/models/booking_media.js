import mongoose from "mongoose";
import pkg from "mongoose-sequence";
import mongoose_delete from "mongoose-delete";

const AutoIncrement = pkg(mongoose);
const { Schema } = mongoose;

const bookingMediaSchema = new Schema(
  {
    bookingMediaId: {
      type: Number,
      unique: true,
    },
    bookingId: {
      type: Number,
      ref: "Booking",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

bookingMediaSchema.plugin(AutoIncrement, {
  inc_field: "bookingMediaId",
  start_seq: 1,
});
bookingMediaSchema.plugin(mongoose_delete, {
  deletedAt: true,
  overrideMethods: "all",
});
const BookingMedia = mongoose.model("BookingMedia", bookingMediaSchema);

export default BookingMedia;
