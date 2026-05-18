import { Request, Response } from "express";
import * as GroupService from "@/services/group.service";
import { isConnected } from "@/whatsappClient";
import { sendSuccess, sendError } from "@/utils/response";

export const getGroups = async (_: Request, res: Response) => {
  if (!isConnected()) {
    return sendError(res, "Not connected to WhatsApp", undefined, 403);
  }

  try {
    const groups = await GroupService.getGroups();
    return sendSuccess(res, "Groups fetched successfully", groups);
  } catch (error) {
    console.error("❌ getGroups failed:", error);
    if (error instanceof Error) {
      return sendError(res, "Failed to fetch groups", error.message, 500);
    }
    return sendError(res, "Failed to fetch groups", "Unknown error", 500);
  }
};

export const getGroupByName = async (req: Request, res: Response) => {
  if (!isConnected()) {
    return sendError(res, "Not connected to WhatsApp", undefined, 403);
  }

  try {
    const name = Array.isArray(req.params.name) ? req.params.name[0] : req.params.name;
    if (!name) {
      return sendError(res, "Missing required parameter: name", undefined, 400);
    }

    const group = await GroupService.getGroupByName(name as string);
    return sendSuccess(res, "Group fetched successfully", group);
  } catch (error) {
    if (error instanceof Error && error.message.includes("not found")) {
      return sendError(res, "Group not found", error.message, 404);
    }
    console.error("❌ getGroupByName failed:", error);
    if (error instanceof Error) {
      return sendError(res, "Failed to fetch group by name", error.message, 500);
    }
    return sendError(res, "Failed to fetch group by name", "Unknown error", 500);
  }
};

export const getGroupById = async (req: Request, res: Response) => {
  if (!isConnected()) {
    return sendError(res, "Not connected to WhatsApp", undefined, 403);
  }

  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    if (!id) {
      return sendError(res, "Missing required parameter: id", undefined, 400);
    }

    const group = await GroupService.getGroupById(id as string);
    return sendSuccess(res, "Group fetched successfully", group);
  } catch (error) {
    if (error instanceof Error && error.message.includes("not found")) {
      return sendError(res, "Group not found", error.message, 404);
    }
    console.error("❌ getGroupById failed:", error);
    if (error instanceof Error) {
      return sendError(res, "Failed to fetch group by ID", error.message, 500);
    }
    return sendError(res, "Failed to fetch group by ID", "Unknown error", 500);
  }
};

export const getGroupsMin = async (_: Request, res: Response) => {
  if (!isConnected()) {
    return sendError(res, "Not connected to WhatsApp", undefined, 403);
  }

  try {
    const groups = await GroupService.getGroupsMin();
    return sendSuccess(res, "Groups fetched successfully", groups);
  } catch (error) {
    console.error("❌ getGroupsMin failed:", error);
    if (error instanceof Error) {
      return sendError(res, "Failed to fetch minimum groups", error.message, 500);
    }
    return sendError(res, "Failed to fetch minimum groups", "Unknown error", 500);
  }
};

export const getGroupByNameMin = async (req: Request, res: Response) => {
  if (!isConnected()) {
    return sendError(res, "Not connected to WhatsApp", undefined, 403);
  }

  try {
    const name = Array.isArray(req.params.name) ? req.params.name[0] : req.params.name;
    if (!name) {
      return sendError(res, "Missing required parameter: name", undefined, 400);
    }

    const group = await GroupService.getGroupByNameMin(name as string);
    
    if (!group) {
      return sendError(res, `Group with name "${name}" not found`, undefined, 404);
    }
    
    return sendSuccess(res, "Group fetched successfully", group);
  } catch (error) {
    console.error("❌ getGroupByNameMin failed:", error);
    if (error instanceof Error) {
      return sendError(res, "Failed to fetch minimum group by name", error.message, 500);
  }
    return sendError(res, "Failed to fetch minimum group by name", "Unknown error", 500);
  }
};

export const getGroupByIdMin = async (req: Request, res: Response) => {
  if (!isConnected()) {
    return sendError(res, "Not connected to WhatsApp", undefined, 403);
  }

  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    if (!id) {
      return sendError(res, "Missing required parameter: id", undefined, 400);
    }

    const group = await GroupService.getGroupByIdMin(id as string);
    
    if (!group) {
      return sendError(res, `Group with ID "${id}" not found`, undefined, 404);
    }
    
    return sendSuccess(res, "Group fetched successfully", group);
  } catch (error) {
    console.error("❌ getGroupByIdMin failed:", error);
    if (error instanceof Error) {
      return sendError(res, "Failed to fetch minimum group by ID", error.message, 500);
  }
    return sendError(res, "Failed to fetch minimum group by ID", "Unknown error", 500);
  }
};
