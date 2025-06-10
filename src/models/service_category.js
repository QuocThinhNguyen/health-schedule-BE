import mongoose from "mongoose";
import pkg from "mongoose-sequence";
import mongoose_delete from "mongoose-delete";

const AutoIncrement = pkg(mongoose);
const { Schema } = mongoose;

const serviceCategorySchema = new Schema(
  {
    serviceCategoryId: {
      type: Number,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

serviceCategorySchema.plugin(AutoIncrement, {
  inc_field: "serviceCategoryId",
  start_seq: 1,
});
serviceCategorySchema.index({ name: "text" });
serviceCategorySchema.plugin(mongoose_delete, {
  deletedAt: true,
  overrideMethods: "all",
});
const ServiceCategory = mongoose.model(
  "ServiceCategory",
  serviceCategorySchema
);

export default ServiceCategory;
