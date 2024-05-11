import mongoose from "mongoose";
import httpStatus from "http-status";
import httpErrors from "http-errors";
import { CelebrateError, isCelebrateError } from "celebrate";
import HttpException from "@/utils/exceptions/http.exception";
import { NextFunction, Request, Response } from "express";

function handleCelebrateError(err: CelebrateError) {
    let errorBody;

    // 'details' is a Map()
    if (err.details.has("body")) {
        errorBody = err.details.get("body");
    } else if (err.details.has("params")) {
        errorBody = err.details.get("params");
    } else if (err.details.has("query")) {
        errorBody = err.details.get("query");
    } else {
        console.error("default validation error");
    }

    if (errorBody?.details?.[0]?.message) {
        const httpErr = httpErrors(httpStatus.BAD_REQUEST, `${errorBody?.details?.[0]?.message.toString()}`);
        return httpErr;
    }
    else {
        const httpErr = httpErrors(httpStatus.BAD_REQUEST, "Bad request parameters");
        return httpErr;
    }
}


const errorConverter = (err: any, req: Request, res: Response, next: NextFunction) => {
    let error = err;
    if (!(error instanceof HttpException)) {
        if (isCelebrateError(error)) {
            error = handleCelebrateError(error);
        } else {
            const statusCode =
                error.statusCode || error instanceof mongoose.Error
                    ? httpStatus.BAD_REQUEST
                    : httpStatus.INTERNAL_SERVER_ERROR;
            const message = error.message || httpStatus[statusCode];
            error = new HttpException(statusCode, message);
        }
    }
    next(error);
};

export default errorConverter;