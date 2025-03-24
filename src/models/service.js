import mongoose from "mongoose";
import pkg from "mongoose-sequence"; // Import AutoIncrement
import mongoose_delete from "mongoose-delete";

const AutoIncrement = pkg(mongoose);
const { Schema } = mongoose;

const serviceSchema = new Schema(
  {
    serviceId: {
      type: Number,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    price: {
      type: mongoose.Schema.Types.Double,
      required: true,
    },

    description: {
      type: String,
    },

    clinicId: {
      type: Number,
      ref: "Clinic",
    },

    serviceCategoryId: {
      type: Number,
      ref: "ServiceCategory",
    },
  },
  { timestamps: true }
);

serviceSchema.plugin(AutoIncrement, {
  inc_field: "serviceId",
  start_seq: 1,
});
serviceSchema.plugin(mongoose_delete, {
  deletedAt: true,
  overrideMethods: "all",
});
const Service = mongoose.model("Service", serviceSchema);

export default Service;
