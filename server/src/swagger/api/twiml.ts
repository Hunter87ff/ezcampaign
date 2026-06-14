/**
 * @openapi
 * /twiml/connect/{leadId}:
 *   get:
 *     tags: [TwiML]
 *     summary: TwiML voice call bridge
 *     description: >
 *       Returns TwiML XML for voice call bridging. If the lead is found, says "Connecting you to {name}"
 *       then dials the lead's mobile number. If not found, says the lead was not found.
 *       This endpoint is called by Twilio and does not require authentication.
 *     parameters:
 *       - in: path
 *         name: leadId
 *         required: true
 *         schema:
 *           type: string
 *         description: Lead MongoDB ObjectId
 *     responses:
 *       200:
 *         description: TwiML XML response
 *         content:
 *           text/xml:
 *             schema:
 *               type: string
 *               example: '<?xml version="1.0" encoding="UTF-8"?><Response><Say>Connecting you to John Doe</Say><Dial><Number>+919876543210</Number></Dial></Response>'
 */
export {};
