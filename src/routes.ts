import { Router } from "express";
import SendMailController from "./controllers/SendMailController";
import SurveysController from "./controllers/SurveysController";

import UserController from "./controllers/UserController";

const router = Router();

const userController = new UserController();
router.post("/users", userController.create);

const surveysController = new SurveysController();
router.post("/surveys", surveysController.create);
router.get("/surveys", surveysController.show);

const sendMailController = new SendMailController();
router.post("/sendMail", sendMailController.execute);

export default router;