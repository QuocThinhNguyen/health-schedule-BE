import homePageRouter from "./WebRouter.js"
import userRouter from "./UserRouter.js"
import clinicRouter from "./ClinicRouter.js"

import specialtyRouter from "./SpecialtyRouter.js"
import doctorInforRouter from "./DoctorRouter.js"

import bookingRouter from "./BookingRouter.js"
import patientRecordsRouter from "./PatientRecordsRouter.js"
import scheduleRouter from "./ScheduleRouter.js"
import adminRouter from "./AdminRouter.js"
import allCodeRouter from "./AllCodeRouter.js"
import {handleError} from "../middlewares/authMiddleware.js"

const routes = (app) => {
    app.use('/', homePageRouter)
   
    app.use(handleError);
}

export default routes