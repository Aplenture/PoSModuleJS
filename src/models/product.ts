/**
 * Aplenture/PoSModuleJS
 * https://github.com/Aplenture/PoSModuleJS
 * Copyright (c) 2023 Aplenture
 * MIT License https://github.com/Aplenture/PoSModuleJS/blob/main/LICENSE
 */

export interface Product {
    readonly id: number;
    readonly account: number;
    readonly created: number;
    readonly name: string;
    readonly price: number;
    readonly discount: number;
}