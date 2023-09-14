/**
 * Aplenture/PoSModuleJS
 * https://github.com/Aplenture/PoSModuleJS
 * Copyright (c) 2023 Aplenture
 * MIT License https://github.com/Aplenture/PoSModuleJS/blob/main/LICENSE
 */

export enum PaymentMethod {
    None = 0,
    Balance = 1 << 0,
    Cash = 1 << 1
}