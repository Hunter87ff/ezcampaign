import config from ".";
import mongoose from "mongoose";
import {logger} from "@/utils/logger";

export default async function db(){
    try {
        const uri = config.db_uri;
        const con = await mongoose.connect(uri, {
            dbName : "ezcampaign"
        });
        logger.info("Database connected", con.connection.host);
        return con;
    } catch (error) {
        logger.error("Error while connecting to database", error);
        process.exit(1);
    }
}