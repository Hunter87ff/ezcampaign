import express from 'express';
import models from "@/models";
import cookieParser from 'cookie-parser';
import validator from "@/validator";
import { Sanitizer } from '@/utils/sanitize';
import { ResponseHandler } from '@/utils/response';
import { Logger } from '@/utils/logger';

// import type { Token } from '@/utils/wrappers/token';


declare module 'express-serve-static-core' {
    interface Application {
        db: typeof models;
        // schema: typeof schema;
        logger: Logger;
        jwts: Set<string>;
        sanitize: Sanitizer;
        validator: typeof validator;
        responseHandler: ResponseHandler;
    }
    interface Request {
        // user?: Token;
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

export default async function middlewares(app: express.Express) {
    app.use(express.json({ limit: '5MB' }));
    app.use(cookieParser());
    app.use(express.urlencoded({ extended: true, limit: '5MB' }));
    app.use(express.static('public'));
    app.db = models;
    // app.schema = schema;
    // app.cache = cache;
    // app.helper = helper;
    app.logger = Logger.instance;
    app.sanitize = Sanitizer;
    app.validator = validator;
    app.jwts = new Set<string>([]);
    app.responseHandler = new ResponseHandler();

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
