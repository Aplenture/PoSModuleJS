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
    readonly customer: number;
    readonly product: number;
}

export class CancelProduct extends BackendJS.Module.Command<Context, Args, Options> {
    public readonly description = 'removes a product from an order of a customer';
    public readonly parameters = new CoreJS.ParameterList(
        new CoreJS.NumberParameter('account', 'account id'),
        new CoreJS.NumberParameter('customer', 'id of customer'),
        new CoreJS.NumberParameter('product', 'id of product')
    );

    public async execute(args: Args): Promise<CoreJS.Response> {
        const order = await this.context.orderRepository.getOpenOrderByCustomer(args.customer);

        if (!order)
            return new CoreJS.ErrorResponse(CoreJS.ResponseCode.Forbidden, '#_order_invalid');

        if (order.account != args.account)
            return new CoreJS.ErrorResponse(CoreJS.ResponseCode.Forbidden, '#_permission_denied');

        if (order.state != OrderState.Open)
            return new CoreJS.ErrorResponse(CoreJS.ResponseCode.Forbidden, '#_order_not_open');

        const product = await this.context.productRepository.get(args.product);

        if (!product)
            return new CoreJS.ErrorResponse(CoreJS.ResponseCode.Forbidden, '#_order_invalid_product');

        const result = await this.context.orderRepository.cancelProduct(order.id, args.product);

        if (await this.context.orderRepository.hasProducts(order.id))
            return new CoreJS.BoolResponse(result);

        this.message(`delete empty order '${order.id}'`);

        await this.context.orderRepository.deleteOrder(order.id);

        return new CoreJS.TextResponse('#_order_deleted');
    }
}