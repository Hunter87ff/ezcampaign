import mongoose from "mongoose";
import {logger} from "@/utils/logger";

export default async function db(){
    try {
        const con = await mongoose.connect(process.env.DB_URL!);
        logger.info("Database connected", con.connection.host);
        return con;
    } catch (error) {
        logger.error("Error while connecting to database", error);
        process.exit(1);
    }
}