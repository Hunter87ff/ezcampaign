import type { Request, Response } from "express";
import { twiml } from "twilio";

export default class TwiMLController {
    /**
     * TwiML XML for call bridge.
     * @route GET /twiml/connect/:leadId
     * @access public
     */
    static async connect(req: Request, res: Response) {
        try {
            const { leadId } = req.params;
            const message = req.query.message as string | undefined;

            // Fetch lead
            const lead = await req.db.Lead.findOne({ _id: leadId, isDeleted: false });
            if (!lead) {
                const voiceResponse = new twiml.VoiceResponse();
                voiceResponse.say("Sorry, the lead was not found in our system.");
                res.type("text/xml");
                return res.send(voiceResponse.toString());
            }

            const voiceResponse = new twiml.VoiceResponse();
            if (message) {
                voiceResponse.say(message);
                voiceResponse.hangup();
            } else {
                voiceResponse.say(`Connecting you to ${lead.name}`);
                voiceResponse.dial().number(lead.mobileNumber);
            }

            res.type("text/xml");
            return res.send(voiceResponse.toString());

        } catch (error: any) {
            const voiceResponse = new twiml.VoiceResponse();
            voiceResponse.say("An error occurred on the server while connecting your call.");
            res.type("text/xml");
            return res.send(voiceResponse.toString());
        }
    }
}
