import mongoose from 'mongoose';
import pkg from 'mongoose-sequence';  // Import AutoIncrement
const AutoIncrement = pkg(mongoose);

const { Schema } = mongoose;

const bookingMediaSchema = new Schema({
    bookingMediaId: {
        type: Number,
        unique: true
    },
    bookingId: {
        type: Number,
        ref: 'Booking',
        required: true
    },
    name: {
        type: String,
        required: true
    }
});

bookingMediaSchema.plugin(AutoIncrement, { inc_field: 'bookingMediaId', start_seq: 1 });
const BookingMedia = mongoose.model('BookingMedia', bookingMediaSchema);

export default BookingMedia;