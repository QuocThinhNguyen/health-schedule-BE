import mongoose from "mongoose";
import pkg from "mongoose-sequence";
import mongoose_delete from "mongoose-delete";

const AutoIncrement = pkg(mongoose);
const { Schema } = mongoose;

const historySchema = new Schema(
  {
    historyId: {
      type: Number,
      unique: true,
    },
    patientId: {
      type: Number,
      ref: "Users",
      required: true,
    },
    patientRecordId: {
      type: Number,
      ref: "PatientRecord",
      required: true,
    },
    doctorId: {
      type: Number,
      ref: "Doctor_info",
      required: true,
    },
    bookingId: {
      type: Number,
      ref: "Booking",
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

historySchema.plugin(AutoIncrement, { inc_field: "historyId", start_seq: 1 });
historySchema.plugin(mongoose_delete, {
  deletedAt: true,
  overrideMethods: "all",
});
const History = mongoose.model("History", historySchema);

export default History;
