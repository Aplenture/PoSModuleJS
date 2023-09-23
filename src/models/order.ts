/**
 * Aplenture/PoSModuleJS
 * https://github.com/Aplenture/PoSModuleJS
 * Copyright (c) 2023 Aplenture
 * MIT License https://github.com/Aplenture/PoSModuleJS/blob/main/LICENSE
 */

import { OrderState, PaymentMethod } from "../enums";

export interface Order {
    readonly id: number;
    readonly account: number;
    readonly updated: number;
    readonly state: OrderState;
    readonly customer: number;
    readonly paymentMethod: PaymentMethod;
    readonly tip: number;
}