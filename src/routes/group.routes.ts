import { Router } from "express";
import {
  getGroups,
  getGroupByName,
  getGroupById,
  getGroupsMin,
  getGroupByNameMin,
  getGroupByIdMin
} from "@/controllers/group.controller";

const router = Router();

router.get("/", getGroups);
router.get("/min", getGroupsMin);
router.get("/name/:name", getGroupByName);
router.get("/name/:name/min", getGroupByNameMin);
router.get("/id/:id", getGroupById);
router.get("/id/:id/min", getGroupByIdMin);

export default router;