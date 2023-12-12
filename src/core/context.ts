/**
 * Aplenture/PoSModuleJS
 * https://github.com/Aplenture/PoSModuleJS
 * Copyright (c) 2023 Aplenture
 * MIT License https://github.com/Aplenture/PoSModuleJS/blob/main/LICENSE
 */

import * as BackendJS from "backendjs";
import { CustomerRepository, OrderRepository, ProductRepository, LabelRepository } from "../repositories";

export interface Context extends BackendJS.Module.Context {
    readonly balanceRepository: BackendJS.Balance.Repository;
    readonly customerRepository: CustomerRepository;
    readonly orderRepository: OrderRepository;
    readonly productRepository: ProductRepository;
    readonly labelRepository: LabelRepository;
}