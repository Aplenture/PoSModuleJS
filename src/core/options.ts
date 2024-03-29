/**
 * Aplenture/PoSModuleJS
 * https://github.com/Aplenture/PoSModuleJS
 * Copyright (c) 2023 Aplenture
 * MIT License https://github.com/Aplenture/PoSModuleJS/blob/main/LICENSE
 */

import * as BackendJS from "backendjs";
import { OrderTables } from "../models/orderTables";
import { BackupArgs } from "../commands";

export interface Options extends BackendJS.Module.Options {
    readonly discount: number;
    readonly databaseConfig: BackendJS.Database.Config;
    readonly balanceTables?: BackendJS.Balance.Tables;
    readonly customerTable?: string;
    readonly orderTables?: OrderTables;
    readonly productTable?: string;
    readonly labelTable?: string;
    readonly backup?: BackupArgs;
}