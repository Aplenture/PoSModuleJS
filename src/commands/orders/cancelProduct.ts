/**
 * Aplenture/PoSModuleJS
 * https://github.com/Aplenture/PoSModuleJS
 * Copyright (c) 2023 Aplenture
 * MIT License https://github.com/Aplenture/PoSModuleJS/blob/main/LICENSE
 */

import * as BackendJS from "backendjs";
import * as CoreJS from "corejs";
import { Args as GlobalArgs, Context, Options } from "../../core";

interface Args extends GlobalArgs {
    readonly order: number;
    readonly product: number;
}

export class CancelProduct extends BackendJS.Module.Command<Context, Args, Options> {
    public readonly description = 'removes a product from an order';
    public readonly parameters = new CoreJS.ParameterList(
        new CoreJS.NumberParameter('order', 'id of order'),
        new CoreJS.NumberParameter('product', 'id of product')
    );

    public async execute(args: Args): Promise<CoreJS.Response> {
        if (!await this.context.orderRepository.hasOrder(args.order))
            return new CoreJS.ErrorResponse(CoreJS.ResponseCode.Forbidden, '#_order_invalid');

        const product = await this.context.productRepository.get(args.product);

        if (!product)
            return new CoreJS.ErrorResponse(CoreJS.ResponseCode.Forbidden, '#_order_invalid_product');

        const result = await this.context.orderRepository.cancelProduct(args.order, args.product);

        return new CoreJS.BoolResponse(result);
    }
}