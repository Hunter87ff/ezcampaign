# Agent Developer Guidelines & Project Overview

This document provides a core overview of the project and developer guidelines that must be strictly followed when extending or working on the `server` codebase.

---

## 1. Project Overview

We are building a full-stack **WhatsApp Campaign Management Dashboard** where an administrator can manage leads, filter templates by business type, send messages, handle callbacks, initiate calls, and monitor analytics.

### Key Functional Areas
1. **Authentication**: Admin JWT login with bcrypt security.
2. **Lead Management**: Lead profiles tagged with required `businessType` and `status` values. Supports soft deletion (`isDeleted`).
3. **WhatsApp Template Management**: Create/view templates. Twilio templates are auto-filtered by lead `businessType` prior to selection.
4. **WhatsApp Dispatch & Webhooks**: Dispatch template messages using Twilio. Capture incoming replies via webhook, update message logs, and respond with empty TwiML `<Response/>`.
5. **Twilio Voice Calls**: Outbound calling to leads with TwiML call routing and call status update webhooks.
6. **Analytics Feed**: Operational summary metrics.

---

## 2. Mandatory Coding Guidelines

### A. Zod for Runtime Input Validation
- **Requirement**: Use Zod schemas to validate all client-supplied inputs (API route request body, query params, path variables, webhooks).
- **Execution**: Run validations in Express route handlers or custom middlewares before database modifications or third-party API calls.
- **Example**:
  ```typescript
  import { z } from 'zod';
  
  export const loginSchema = z.object({
      email: z.string().email(),
      password: z.string().min(6),
  });
  ```

### B. Strictly Avoid Implicit `any` Type
- **Requirement**: `tsconfig.json` enforces `strict: true`. The use of `any` (implicit or explicit) is strictly prohibited.
- **Execution**: 
  - Ensure every variable, parameter, class property, and return type has an explicit type/interface/generic.
  - For express request handler parameters (`req`, `res`, `next`), use types from `express` package (e.g., `Request`, `Response`, `NextFunction`).
  - Use generic models and type assertions safely.

### C. Reuse Existing Utility Functions
- **Requirement**: Do not re-implement authentication, tokens, hashing, logging, or response formatting.
- **Utilities**:
  - **Hashing / JWT**: Import `Helper` from `@/utils/helper` or `src/utils/helper` for:
    - `Helper.hashPassword(password: string): Promise<string>`
    - `Helper.comparePassword(password: string, hash: string): Promise<boolean>`
    - `Helper.generateToken(payload: Object): Promise<string>`
    - `Helper.verifyToken(token: string): Promise<any>`
  - **Responses**: Use `ResponseHandler` in `@/utils/response` for uniform HTTP responses (e.g., `ResponseHandler.ok`, `ResponseHandler.created`, `ResponseHandler.badRequest`, etc.).
  - **Logging**: Use standard logger in `@/utils/logger`.

### D. Data Model Structure
- All models are placed under `src/models/`.
- Export a typescript interface extending `mongoose.Document` alongside each model.
- Maintain soft deletes on `Lead` (`isDeleted` boolean flag).
- User password hashing is handled automatically via a pre-save Mongoose hook.

---

## 3. Database Schema Overview

Refer to `task.md` or Mongoose models directly for the precise types.

- **`users`**: `name`, `email` (unique), `passwordHash`, `role` (enum: `'admin' | 'manager'`).
- **`leads`**: `name`, `mobileNumber` (unique), `email` (optional), `businessType` (enum), `status` (enum), `notes`, `assignedTemplateId` (Ref: `templates`), `isDeleted`.
- **`templates`**: `name`, `templateSid`, `businessType` (enum), `variables` (string array), `sampleBody`, `isActive`.
- **`message_logs`**: `leadId` (Ref: `leads`), `direction` (`'outbound' | 'inbound'`), `templateSid`, `body`, `twilioSid`, `status`, `sentAt`.
- **`call_logs`**: `leadId` (Ref: `leads`), `phoneNumber`, `twilioCallSid`, `status`, `startTime`, `endTime`, `duration`.
- **`activity_logs`**: `leadId` (Ref: `leads`, optional), `action` (enum), `details` (Mixed), `createdAt`.


### 4. Controller Implementation Guidelines
when implementing controllers, make sure to follow this pattern
```js
import {Request, Response} from 'express';

export default class ControllerName{

  /**
  * returns all items
  * @route GET /getitems
  * @access public | admin | manager
  */
  static async getItems(req: Request, res: Response){
    try{
      const dbItems = await req.db.Collection.find({}); // or whatever db action it is
      return res.handler.success(res, "Success", dbItems);
    }catch(err){
      res.handler.error(res, "message", {err /* or whatever error data is present here */})
    }
  }
}
```

### Good Practice
- always make sure to use the correct types like `req: Request, res: Response, next: NextFunction` instead of `req: any, res: any, next: any`
- add paging to endpoints that retrns list of items 
- use `req.db` to access database collections
- use `res.handler` to access request handlers for sending responses
