/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as ai from "../ai.js";
import type * as analysis from "../analysis.js";
import type * as auth from "../auth.js";
import type * as clauses from "../clauses.js";
import type * as clients from "../clients.js";
import type * as http from "../http.js";
import type * as matters from "../matters.js";
import type * as microsoft from "../microsoft.js";
import type * as playbooks from "../playbooks.js";
import type * as users from "../users.js";
import type * as vectorDb from "../vectorDb.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  ai: typeof ai;
  analysis: typeof analysis;
  auth: typeof auth;
  clauses: typeof clauses;
  clients: typeof clients;
  http: typeof http;
  matters: typeof matters;
  microsoft: typeof microsoft;
  playbooks: typeof playbooks;
  users: typeof users;
  vectorDb: typeof vectorDb;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
