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
    app.use(handleError);
}
export default routes;
