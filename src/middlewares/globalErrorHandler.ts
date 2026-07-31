import { Request, Response, NextFunction } from "express";
import { MulterError } from "multer";
import { AppError } from "../errors/AppError.js";

export const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Something went wrong!";
  let errorDetails = err;

  // Handle our custom AppError specifically
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
  } else if (err instanceof MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      statusCode = 413;
      message = "File is too large. Maximum allowed size is 5MB per file.";
    } else if (err.code === "LIMIT_FILE_COUNT") {
      statusCode = 413;
      message = "Too many files. Maximum allowed is 6 images per request.";
    } else if (err.code === "LIMIT_UNEXPECTED_FILE") {
      statusCode = 400;
      message = "Unexpected file field. Please use the images field for uploads.";
    } else {
      statusCode = 400;
      message = err.message || "File upload failed.";
    }
  } else if (err instanceof Error && err.message.includes("Invalid file type")) {
    statusCode = 400;
    message = err.message;
  }

  res.status(statusCode).json({
    success: false,
    message,
    errorDetails,
  });
};
