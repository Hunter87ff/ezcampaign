/**
 * @openapi
 * /webhook/whatsapp/incoming:
 *   post:
 *     tags: [Webhooks]
 *     summary: Handle incoming WhatsApp message
 *     description: >
 *       Twilio webhook for incoming WhatsApp replies. Validates the payload, finds the lead by mobile number,
 *       saves an inbound message log, updates lead status to "responded", and returns an empty TwiML response.
 *       This endpoint is called by Twilio and does not require authentication.
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             $ref: '#/components/schemas/IncomingWhatsAppWebhook'
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/IncomingWhatsAppWebhook'
 *     responses:
 *       200:
 *         description: TwiML response (always returned to keep Twilio happy)
 *         content:
 *           text/xml:
 *             schema:
 *               type: string
 *               example: '<?xml version="1.0" encoding="UTF-8"?><Response></Response>'
 *
 * /webhook/whatsapp/status:
 *   post:
 *     tags: [Webhooks]
 *     summary: Handle WhatsApp message status update
 *     description: >
 *       Twilio webhook for message status updates. Maps Twilio statuses (sent, delivered, read, failed, undelivered)
 *       to internal statuses (queued, sent, delivered, read, failed) and updates the MessageLog.
 *       This endpoint is called by Twilio and does not require authentication.
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             $ref: '#/components/schemas/WhatsAppStatusWebhook'
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/WhatsAppStatusWebhook'
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: OK
 *       400:
 *         description: Validation error
 *       500:
 *         description: Webhook handler error
 *
 * /webhook/call/status:
 *   post:
 *     tags: [Webhooks]
 *     summary: Handle call status update
 *     description: >
 *       Twilio webhook for call status updates. Maps Twilio call statuses to internal statuses
 *       and updates the CallLog. Sets endTime and duration when the call ends.
 *       This endpoint is called by Twilio and does not require authentication.
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             $ref: '#/components/schemas/CallStatusWebhook'
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CallStatusWebhook'
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: OK
 *       400:
 *         description: Validation error
 *       500:
 *         description: Webhook handler error
 */
export {};
