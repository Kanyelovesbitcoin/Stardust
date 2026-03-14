/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as dreams from "../dreams.js";
import type * as entitlements from "../entitlements.js";
import type * as http from "../http.js";
import type * as imageUtils from "../imageUtils.js";
import type * as interpret from "../interpret.js";
import type * as superwallWebhook from "../superwallWebhook.js";
import type * as transcribe from "../transcribe.js";
import type * as visualize from "../visualize.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  dreams: typeof dreams;
  entitlements: typeof entitlements;
  http: typeof http;
  imageUtils: typeof imageUtils;
  interpret: typeof interpret;
  superwallWebhook: typeof superwallWebhook;
  transcribe: typeof transcribe;
  visualize: typeof visualize;
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
