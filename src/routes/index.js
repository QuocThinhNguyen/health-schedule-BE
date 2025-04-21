import homePageRouter from "./WebRouter.js";
import allCodeRouter from "./AllCodeRouter.js";
import adminRouter from "./AdminRouter.js";
import userRouter from "./UserRouter.js";
import doctorInforRouter from "./DoctorRouter.js";
import scheduleRouter from "./ScheduleRouter.js"
import bookingRouter from "./BookingRouter.js"
import clinicRouter from "./ClinicRouter.js"
import specialtyRouter from "./SpecialtyRouter.js"
import patientRecordsRouter from "./PatientRecordsRouter.js"
import feedBackRouter from "./FeedBackRouter.js"
import postRouter from "./PostRouter.js"
import bookingMediaRouter from "./BookingMediaRouter.js";
import videoRouter from "./VideoRouter.js";
import bookMarkRouter from "./BookMarkRouter.js";
import commentRouter from "./CommentRouter.js";
import chatBotRouter from "./ChatBotRouter.js";
import serviceCategoryRouter from "./ServiceCategoryRouter.js";
import serviceController from "./ServiceRouter.js";
import serviceScheduleRouter from "./ServiceScheduleRouter.js";
import chatRoomRouter from "./ChatRoomRouter.js";
import chatMessageRouter from "./ChatMessageRouter.js";
import {handleError} from "../middlewares/authMiddleware.js"

const routes = (app) => {

    app.use('/', homePageRouter)
    app.use('/allCode',allCodeRouter)
    app.use("/admin", adminRouter);
    app.use('/user', userRouter);
    app.use("/doctor", doctorInforRouter);
    app.use('/schedule', scheduleRouter)
    app.use('/booking',bookingRouter)
    app.use('/clinic', clinicRouter)
    app.use('/specialty', specialtyRouter);
    app.use('/patientrecord', patientRecordsRouter);
    app.use('/feedback', feedBackRouter);
    app.use('/post',postRouter);
    app.use('/bookingImage',bookingMediaRouter);
    app.use('/video',videoRouter);
    app.use('/bookmark',bookMarkRouter);
    app.use('/comment',commentRouter);
    app.use('/chatbot',chatBotRouter);
    app.use('/service-category', serviceCategoryRouter);
    app.use('/service', serviceController);
    app.use('/service-schedule', serviceScheduleRouter);
    app.use('/chat-room', chatRoomRouter);
    app.use('/chat-message', chatMessageRouter);

    app.use(handleError);
}
export default routes;
