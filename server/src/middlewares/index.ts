import cors from "cors";
import express from 'express';
import models from "@/models";
import config from "@/config";
import router from "@/routes";
import swaggerSpec from "@/swagger";
import validator from "@/validator";
import Helper from '@/utils/helper';
import { Logger } from '@/utils/logger';
import cookieParser from 'cookie-parser';
import swaggerUi from "swagger-ui-express";
import RateLimit from "express-rate-limit";
import { Sanitizer } from '@/utils/sanitize';
import { ResponseHandler } from '@/utils/response';
import { type UserToken } from "@/utils/wrappers/usertoken";
import type { NextFunction, Request, Response } from 'express';





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
        user?: UserToken;
        helper: Helper;
        fullUrl?: string;
        sanitize: Sanitizer;
        is_admin?: boolean;
        validator?: typeof validator;
        valid_client: boolean;
        db: typeof models;
    }
    interface Response {
        logger: Logger;
        db: typeof models;
        sanitize: Sanitizer;
        validator?: typeof validator;
        handler: ResponseHandler;
    }
}


async function init(req: Request, res: Response, next: NextFunction) {
    req.db = req.app.db;
    req.helper = Helper;
    req.sanitize = Sanitizer;
    req.validator = validator;
    res.logger = Logger.instance;
    res.handler = req.app.responseHandler;
    next();
}


const limiter = RateLimit({
    windowMs: 1 * 60 * 1000, // 1 minutes
    max: 150, // limit each IP to 100r/s
    message: 'Too many requests from this IP, please try again later',
});


async function security(req: Request, res: Response, next: NextFunction) {
    limiter(req, res, next);
}



export default async function middlewares(app: express.Express) {
    app.use(express.json());
    app.use(cookieParser())
    app.use(express.urlencoded({ extended: true }));
    app.use(express.static('public'));
    app.db = models;
    app.helper = Helper;
    app.logger = Logger.instance;
    app.sanitize = Sanitizer;
    app.validator = validator;
    app.jwts = new Set<string>([]);
    app.responseHandler = new ResponseHandler();
    app.use(cors({
        origin: config.allowed.origins,
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
        credentials: true,
    }))
    app.use(init)
    app.use(security)
    app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec))
    app.get("/docs.json", (_req, res) => {
        res.setHeader("Content-Type", "application/json");
        res.send(swaggerSpec);
    });
    app.use("/", router)
}

export {
    middlewares,
};
