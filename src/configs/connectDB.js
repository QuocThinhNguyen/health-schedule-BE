import mongoose from "mongoose";

async function connectMongoDB() {
    try {
        
        await mongoose.connect("mongodb://localhost:27017/ClinicData");
        // await mongoose.connect("mongodb+srv://root:UTE123456789@cluster0.qpq9dyp.mongodb.net/ClinicData?retryWrites=true&w=majority&appName=Cluster0");
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
    }
}


export default connectMongoDB;

