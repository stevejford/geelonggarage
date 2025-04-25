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
import type * as adminRole from "../adminRole.js";
import type * as auth from "../auth.js";
import type * as communication from "../communication.js";
import type * as contacts from "../contacts.js";
import type * as dashboard from "../dashboard.js";
import type * as email from "../email.js";
import type * as emailHistory from "../emailHistory.js";
import type * as emailHistoryMutations from "../emailHistoryMutations.js";
import type * as http from "../http.js";
import type * as invoices from "../invoices.js";
import type * as leads from "../leads.js";
import type * as migrations from "../migrations.js";
import type * as pdf_dataFetchers from "../pdf/dataFetchers.js";
import type * as pdf_index from "../pdf/index.js";
import type * as pdf_service from "../pdf/service.js";
import type * as pdf_types from "../pdf/types.js";
import type * as pdf_utils from "../pdf/utils.js";
import type * as pdfService from "../pdfService.js";
import type * as pdfTest from "../pdfTest.js";
import type * as quotes from "../quotes.js";
import type * as settings from "../settings.js";
import type * as teamChat from "../teamChat.js";
import type * as test from "../test.js";
import type * as users from "../users.js";
import type * as utils_formatters from "../utils/formatters.js";
import type * as utils_numberGenerator from "../utils/numberGenerator.js";
import type * as utils_searchUtils from "../utils/searchUtils.js";
import type * as utils_stringSimilarity from "../utils/stringSimilarity.js";
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
  adminRole: typeof adminRole;
  auth: typeof auth;
  communication: typeof communication;
  contacts: typeof contacts;
  dashboard: typeof dashboard;
  email: typeof email;
  emailHistory: typeof emailHistory;
  emailHistoryMutations: typeof emailHistoryMutations;
  http: typeof http;
  invoices: typeof invoices;
  leads: typeof leads;
  migrations: typeof migrations;
  "pdf/dataFetchers": typeof pdf_dataFetchers;
  "pdf/index": typeof pdf_index;
  "pdf/service": typeof pdf_service;
  "pdf/types": typeof pdf_types;
  "pdf/utils": typeof pdf_utils;
  pdfService: typeof pdfService;
  pdfTest: typeof pdfTest;
  quotes: typeof quotes;
  settings: typeof settings;
  teamChat: typeof teamChat;
  test: typeof test;
  users: typeof users;
  "utils/formatters": typeof utils_formatters;
  "utils/numberGenerator": typeof utils_numberGenerator;
  "utils/searchUtils": typeof utils_searchUtils;
  "utils/stringSimilarity": typeof utils_stringSimilarity;
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
