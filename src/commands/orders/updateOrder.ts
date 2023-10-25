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
    readonly amount: number;
    readonly discount: number;
}

export class UpdateOrder extends BackendJS.Module.Command<Context, Args, Options> {
    public readonly description = 'updates a product from an order of a customer';
    public readonly parameters = new CoreJS.ParameterList(
        new CoreJS.NumberParameter('account', 'account id'),
        new CoreJS.NumberParameter('customer', 'id of customer'),
        new CoreJS.NumberParameter('product', 'id of product'),
        new CoreJS.NumberParameter('amount', 'amount of product', null),
        new CoreJS.NumberParameter('discount', 'should the product discount be considered', null)
    );

    public async execute(args: Args): Promise<CoreJS.Response> {
        // catch no changes
        if (undefined == args.amount && undefined == args.discount)
            return new CoreJS.BoolResponse(false);

        if (0 > args.amount)
            return new CoreJS.ErrorResponse(CoreJS.ResponseCode.Forbidden, "#_product_amount_invalid");

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

        const price = undefined == args.discount
            ? undefined
            : CoreJS.Currency.percentage(product.price, 100 - args.discount);

        if (0 === args.amount) {
            await this.context.orderRepository.cancelProduct(order.id, args.product);

            if (await this.context.orderRepository.hasProducts(order.id)) return new CoreJS.JSONResponse({
                order: order.id,
                product: product.id,
                amount: 0
            });

            this.message(`delete empty order '${order.id}'`);

            await this.context.orderRepository.deleteOrder(order.id);

            return new CoreJS.TextResponse('#_order_deleted');
        }

        const result = await this.context.orderRepository.updateProduct(order.id, args.product, {
            amount: args.amount,
            price
        });

        if (!result)
            return new CoreJS.ErrorResponse(CoreJS.ResponseCode.Forbidden, '#_order_invalid_product');

        return new CoreJS.JSONResponse(result);
    }
}