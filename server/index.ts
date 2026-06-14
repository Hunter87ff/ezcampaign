import {configDotenv} from 'dotenv';
configDotenv();


import EzCampaign from "./src/app";

const app = new EzCampaign();
app.start();
