import mongoose from "mongoose";
import pkg from "mongoose-sequence";
import mongoose_delete from "mongoose-delete";

const AutoIncrement = pkg(mongoose);
const { Schema } = mongoose;

const doctorClickLogSchema = new Schema({
    logId:{
        type:Number,
        unique:true
    },
    doctorId:{
        type: Number,
        required: true,
        ref:'Users'
    },
    userId:{
        type: Number,
        required: true,
        ref:'Users'
    },
    createdAt:{
        type: Date,
        required: true
    }
})

doctorClickLogSchema.plugin(AutoIncrement, { inc_field: 'logId', start_seq: 1 });
doctorClickLogSchema.plugin(mongoose_delete, {
  deletedAt: true,
  overrideMethods: "all",
});
const DoctorClickLog = mongoose.model('DoctorClickLog', doctorClickLogSchema);

export default DoctorClickLog;