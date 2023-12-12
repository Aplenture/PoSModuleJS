/**
 * Aplenture/PoSModuleJS
 * https://github.com/Aplenture/PoSModuleJS
 * Copyright (c) 2023 Aplenture
 * MIT License https://github.com/Aplenture/PoSModuleJS/blob/main/LICENSE
 */

import * as BackendJS from "backendjs";
import { OrderTables } from "../models/orderTables";

export interface Options extends BackendJS.Module.Options {
    readonly databaseConfig: BackendJS.Database.Config;
    readonly balanceTables?: BackendJS.Balance.Tables;
    readonly customerTable?: string;
    readonly orderTables?: OrderTables;
    readonly productTable?: string;
    readonly labelTable?: string;
}