/**
 * @openapi
 * /api/calls/initiate:
 *   post:
 *     tags: [Calls]
 *     summary: Initiate a voice call
 *     description: Initiate a Twilio voice call to a lead. Returns call log details.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/InitiateCallRequest'
 *     responses:
 *       200:
 *         description: Voice call initiated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: Voice call initiated successfully
 *                 data:
 *                   $ref: '#/components/schemas/CallLog'
 *       400:
 *         description: Validation error or Twilio call failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Lead not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *
 * /api/calls:
 *   get:
 *     tags: [Calls]
 *     summary: List call logs
 *     description: Retrieve paginated call logs with optional filtering by leadId and status.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: leadId
 *         schema:
 *           type: string
 *         description: Filter by lead ID
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [initiated, ringing, in-progress, completed, no-answer, busy, failed]
 *         description: Filter by call status
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Results per page
 *     responses:
 *       200:
 *         description: Call logs retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: Call logs retrieved
 *                 data:
 *                   type: object
 *                   properties:
 *                     calls:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/CallLog'
 *                     pagination:
 *                       $ref: '#/components/schemas/Pagination'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *
 * /api/calls/{id}:
 *   delete:
 *     tags: [Calls]
 *     summary: Delete a call log
 *     description: Permanently delete a call log by ID.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Call log ID
 *     responses:
 *       200:
 *         description: Call log deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: Call log deleted successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: 60d0fe4f5311236168a109ca
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Call log not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
export {};
