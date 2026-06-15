





import * as auth from "./auth";
import * as lead from "./lead";
import * as template from "./template";
import * as message from "./message";
import * as call from "./call";
import * as webhook from "./webhook";
import * as configSchema from "./config";

export const validator = {
    auth,
    lead,
    template,
    message,
    call,
    webhook,
    config: configSchema
};

export default validator;