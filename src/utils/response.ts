import { Response } from "express";

export interface ApiResponse<T = unknown> {
    success: boolean;
    message?: string;
    data?: T;
    error?: unknown;
}

export function sendSuccess<T>(res: Response, message?: string, data?: T, statusCode: number = 200) {
    const response: ApiResponse<T> = { success: true };
    if (message) response.message = message;
    if (data !== undefined) response.data = data;
    return res.status(statusCode).json(response);
}

export function sendError(res: Response, message?: string, error?: unknown, statusCode: number = 500) {
    const response: ApiResponse = { success: false };
    if (message) response.message = message;
    if (error !== undefined) response.error = error;
    return res.status(statusCode).json(response);
}
