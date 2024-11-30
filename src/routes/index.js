import homePageRouter from "./WebRouter.js";
import allCodeRouter from "./AllCodeRouter.js";
import doctorInforRouter from "./DoctorRouter.js";
import userRouter from "./UserRouter.js";
import adminRouter from "./AdminRouter.js";
import { handleError } from "../middlewares/authMiddleware.js";

const routes = (app) => {
  app.use("/", homePageRouter);
  app.use("/allCode", allCodeRouter);
  app.use("/user", userRouter);
  app.use("/doctor", doctorInforRouter);
  app.use("/admin", adminRouter);
  app.use(handleError);
};

export default routes;
