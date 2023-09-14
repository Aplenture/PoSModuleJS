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
    readonly amount: number;
    readonly discount: number;
}

export class OrderProduct extends BackendJS.Module.Command<Context, Args, Options> {
    public readonly description = 'creates an order';
    public readonly parameters = new CoreJS.ParameterList(
        new CoreJS.NumberParameter('order', 'id of order'),
        new CoreJS.NumberParameter('product', 'id of product'),
        new CoreJS.NumberParameter('amount', 'amount of product', 1),
        new CoreJS.NumberParameter('discount', 'should the product discount be considered', null)
    );

    public async execute(args: Args): Promise<CoreJS.Response> {
        if (!await this.context.orderRepository.hasOrder(args.order))
            return new CoreJS.ErrorResponse(CoreJS.ResponseCode.Forbidden, '#_order_invalid');

        const product = await this.context.productRepository.get(args.product);

        if (!product)
            return new CoreJS.ErrorResponse(CoreJS.ResponseCode.Forbidden, '#_order_invalid_product');

        const price = undefined == args.discount
            ? CoreJS.Currency.percentage(product.price, 100 - product.discount)
            : CoreJS.Currency.percentage(product.price, 100 - args.discount);

        const result = await this.context.orderRepository.orderProduct(args.order, args.product, price, args.amount);

        if (!result)
            return new CoreJS.ErrorResponse(CoreJS.ResponseCode.Forbidden, '#_order_open_already');

        return new CoreJS.JSONResponse(result);
    }
}