import e from "express";
import config from "@/config"
import db from "@/config/db";
import { logger } from "@/utils/logger";
import middlewares from "@/middlewares";



export default class EzCampaign{
    private app: e.Application;
    public logger : typeof logger;
    public config : typeof config;

    constructor(){
        const app = e();
        this.app = app;
        this.logger = logger;
        this.config = config;
        middlewares(app);
    }


    public async start(){
        this.app.listen(config.port, async ()=>{
            logger.info(`Server running on port: ${config.port}`);
            await db()
        })
    }

    
}

