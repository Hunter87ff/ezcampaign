import cors from "cors";
import express from 'express';
import models from "@/models";
import cookieParser from 'cookie-parser';
import validator from "@/validator";
import { Sanitizer } from '@/utils/sanitize';
import { ResponseHandler } from '@/utils/response';
import { Logger } from '@/utils/logger';
import Helper from '@/utils/helper';
import RateLimit from "express-rate-limit";
import type { NextFunction, Request, Response } from 'express';

// import type { Token } from '@/utils/wrappers/token';


declare module 'express-serve-static-core' {
    interface Application {
        db: typeof models;
        // schema: typeof schema;
        helper: Helper;
        logger: Logger;
        jwts: Set<string>;
        sanitize: Sanitizer;
        validator: typeof validator;
        responseHandler: ResponseHandler;
    }
    interface Request {
        // user?: Token;
        helper: Helper;
        fullUrl?: string;
        sanitize: Sanitizer;
        is_admin?: boolean;
        validator?: typeof validator;
        valid_client: boolean;
    }
    interface Response {
        logger: Logger;
        db: typeof models;
        // schema: typeof schema;
        sanitize: Sanitizer;
        validator?: typeof validator;
        handler: ResponseHandler;
    }
}


async function init(req: Request, res: Response, next: NextFunction){
    req.helper = Helper;
    req.sanitize = Sanitizer;
    req.validator = validator;
    res.logger = Logger.instance;
    res.handler = req.app.responseHandler;
    next();
}


const limiter = RateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later',
});


async function security(req : Request, res : Response, next: NextFunction){
    limiter(req, res, next);
}



export default async function middlewares(app: express.Express) {
    app.use(express.json({ limit: '5MB' }));
    app.use(cookieParser());
    app.use(express.urlencoded({ extended: true, limit: '5MB' }));
    app.use(express.static('public'));
    app.db = models;
    // app.schema = schema;
    // app.cache = cache;
    app.helper = Helper;
    app.logger = Logger.instance;
    app.sanitize = Sanitizer;
    app.validator = validator;
    app.jwts = new Set<string>([]);
    app.responseHandler = new ResponseHandler();

    app.use(init)

    app.use(security)

    // app.use(initialMiddleware);
    // app.use(securityHeaders());
}

export {
    middlewares,
//     securityHeaders,
//     validateClient,
//     validateApiKey,
//     isAdmin,
//     requireAuth,
//     initUser,
//     initialMiddleware,
};
