import { Router } from "express";
import { sendMessageController } from "@/controllers/message.controller";

const router = Router();

router.post("/send", sendMessageController);

export default router;