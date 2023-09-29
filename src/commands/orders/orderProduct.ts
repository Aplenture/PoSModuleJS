/**
 * Aplenture/PoSModuleJS
 * https://github.com/Aplenture/PoSModuleJS
 * Copyright (c) 2023 Aplenture
 * MIT License https://github.com/Aplenture/PoSModuleJS/blob/main/LICENSE
 */

import * as BackendJS from "backendjs";
import * as CoreJS from "corejs";
import { Args as GlobalArgs, Context, Options } from "../../core";
import { OrderState } from "../../enums";

interface Args extends GlobalArgs {
    readonly account: number;
    readonly order: number;
    readonly product: number;
    readonly amount: number;
    readonly discount: number;
}

export class OrderProduct extends BackendJS.Module.Command<Context, Args, Options> {
    public readonly description = 'adds a product to an order';
    public readonly parameters = new CoreJS.ParameterList(
        new CoreJS.NumberParameter('account', 'account id'),
        new CoreJS.NumberParameter('order', 'id of order'),
        new CoreJS.NumberParameter('product', 'id of product'),
        new CoreJS.NumberParameter('amount', 'amount of product', 1),
        new CoreJS.NumberParameter('discount', 'should the product discount be considered', null)
    );

    public async execute(args: Args): Promise<CoreJS.Response> {
        const order = await this.context.orderRepository.getOrder(args.order);

        if (!order)
            return new CoreJS.ErrorResponse(CoreJS.ResponseCode.Forbidden, '#_order_invalid');

        if (order.account != args.account)
            return new CoreJS.ErrorResponse(CoreJS.ResponseCode.Forbidden, '#_permission_denied');

        if (order.state != OrderState.Open)
            return new CoreJS.ErrorResponse(CoreJS.ResponseCode.Forbidden, '#_order_not_open');

        const product = await this.context.productRepository.get(args.product);

        if (!product)
            return new CoreJS.ErrorResponse(CoreJS.ResponseCode.Forbidden, '#_order_invalid_product');

        if (product.account != args.account)
            return new CoreJS.ErrorResponse(CoreJS.ResponseCode.Forbidden, '#_permission_denied');

        const price = undefined == args.discount
            ? CoreJS.Currency.percentage(product.price, 100 - product.discount)
            : CoreJS.Currency.percentage(product.price, 100 - args.discount);

        const result = await this.context.orderRepository.orderProduct(args.order, args.product, price, args.amount);

        return new CoreJS.JSONResponse(result);
    }
}