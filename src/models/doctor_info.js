import mongoose from 'mongoose';
import pkg from 'mongoose-sequence';  // Import AutoIncrement
const AutoIncrement = pkg(mongoose);

const { Schema } = mongoose;

const doctorInfoSchema = new Schema({
    doctorInforId: {
        type: Number,
        unique: true
    },
    doctorId: {
        type: Number,
        ref: 'Users',
        required: true
    },
    specialtyId: {
        type: Number,
        ref: 'Specialty',
    },
    clinicId: {
        type: Number,
        ref: 'Clinic',
    },
    price: {
        type: String,
    },
    note: {
        type: String
    },
    position: {
        type: String,
        ref: 'Allcodes'
    },
    description: {
        type: String
    }
});

doctorInfoSchema.plugin(AutoIncrement, { inc_field: 'doctorInforId', start_seq: 1 });
const DoctorInfo = mongoose.model('DoctorInfo', doctorInfoSchema);

export default DoctorInfo;