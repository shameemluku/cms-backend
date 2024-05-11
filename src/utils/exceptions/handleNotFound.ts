import { NextFunction, Request, Response } from "express";
import HttpException from "./http.exception";
import httpStatus from "http-status";

function handleNotFound(req: Request, res: Response, next: NextFunction) {
    return next(new HttpException(httpStatus.NOT_FOUND, 'Not found'));
}

export default handleNotFound