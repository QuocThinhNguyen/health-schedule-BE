import homePageRouter from "./WebRouter.js"
import allCodeRouter from "./AllCodeRouter.js"
import userRouter from "./UserRouter.js"
import {handleError} from "../middlewares/authMiddleware.js"

const routes = (app) => {
    app.use('/', homePageRouter)
    app.use('/allCode',allCodeRouter)
    app.use('/user', userRouter)
    app.use(handleError);
}

export default routes