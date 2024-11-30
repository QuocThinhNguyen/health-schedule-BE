import homePageRouter from "./WebRouter.js"
import allCodeRouter from "./AllCodeRouter.js"
import userRouter from "./UserRouter.js"
import bookingRouter from "./BookingRouter.js"
import clinicRouter from "./ClinicRouter.js"
import specialtyRouter from "./SpecialtyRouter.js"
import {handleError} from "../middlewares/authMiddleware.js"

const routes = (app) => {
    app.use('/', homePageRouter)
    app.use('/allCode',allCodeRouter)
    app.use('/user', userRouter)
    app.use('/booking',bookingRouter)
    app.use('/clinic', clinicRouter)
    app.use('/specialty', specialtyRouter)

    app.use(handleError);
}

export default routes