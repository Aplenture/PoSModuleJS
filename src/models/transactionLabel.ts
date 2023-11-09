/**
 * Aplenture/PoSModuleJS
 * https://github.com/Aplenture/PoSModuleJS
 * Copyright (c) 2023 Aplenture
 * MIT License https://github.com/Aplenture/PoSModuleJS/blob/main/LICENSE
 */

import { TransactionType } from "../enums";

export interface TransactionLabel {
    readonly id: number;
    readonly account: number;
    readonly type: TransactionType;
    readonly name: string;
}