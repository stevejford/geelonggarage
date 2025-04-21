/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as accounts from "../accounts.js";
import type * as auth from "../auth.js";
import type * as contacts from "../contacts.js";
import type * as dashboard from "../dashboard.js";
import type * as email from "../email.js";
import type * as http from "../http.js";
import type * as invoices from "../invoices.js";
import type * as leads from "../leads.js";
import type * as quotes from "../quotes.js";
import type * as settings from "../settings.js";
import type * as users from "../users.js";
import type * as utils_numberGenerator from "../utils/numberGenerator.js";
import type * as webhooks from "../webhooks.js";
import type * as workOrders from "../workOrders.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  accounts: typeof accounts;
  auth: typeof auth;
  contacts: typeof contacts;
  dashboard: typeof dashboard;
  email: typeof email;
  http: typeof http;
  invoices: typeof invoices;
  leads: typeof leads;
  quotes: typeof quotes;
  settings: typeof settings;
  users: typeof users;
  "utils/numberGenerator": typeof utils_numberGenerator;
  webhooks: typeof webhooks;
  workOrders: typeof workOrders;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
