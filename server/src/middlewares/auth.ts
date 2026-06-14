import { logger } from "@/utils/logger";
import type { Request, Response, NextFunction } from "express";
import { UserToken } from "@/utils/wrappers/usertoken";







async function initUserToken(req : Request){
    const token = req.cookies.token || req.header("Authorization") || ""
    if (!token){return}
    try{
        const user = await UserToken.fromToken(token)
        req.user = user ?? undefined
    }
    catch (err){
        logger.error(err)
    }
}



export async function authorize(req: Request, res: Response, next: NextFunction){
    await initUserToken(req)
    if (!req.user){
        return res.handler.unAuthorized(res, "Token Expired or Invalid.")
    }
    next()
}
