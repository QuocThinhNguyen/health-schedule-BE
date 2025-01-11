import mongoose from 'mongoose';
import pkg from 'mongoose-sequence';  // Import AutoIncrement
const AutoIncrement = pkg(mongoose);

const { Schema } = mongoose;

const bookingImagesSchema = new Schema({
    bookingImageId: {
        type: Number,
        unique: true
    },
    bookingId: {
        type: Number,
        ref: 'Booking',
        required: true
    },
    imageName: {
        type: String,
        required: true
    }
});

bookingImagesSchema.plugin(AutoIncrement, { inc_field: 'bookingImageId', start_seq: 1 });
const BookingImages = mongoose.model('BookingImages', bookingImagesSchema);

export default BookingImages;