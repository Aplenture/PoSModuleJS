/**
 * Aplenture/PoSModuleJS
 * https://github.com/Aplenture/PoSModuleJS
 * Copyright (c) 2023 Aplenture
 * MIT License https://github.com/Aplenture/PoSModuleJS/blob/main/LICENSE
 */

import { LabelType } from "../enums";

export interface Label {
    readonly id: number;
    readonly account: number;
    readonly type: LabelType;
    readonly name: string;
}