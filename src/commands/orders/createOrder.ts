/**
 * Aplenture/PoSModuleJS
 * https://github.com/Aplenture/PoSModuleJS
 * Copyright (c) 2023 Aplenture
 * MIT License https://github.com/Aplenture/PoSModuleJS/blob/main/LICENSE
 */

import * as BackendJS from "backendjs";
import * as CoreJS from "corejs";
import { Args as GlobalArgs, Context, Options } from "../../core";
import { PaymentMethod } from "../../enums";

interface Args extends GlobalArgs {
    readonly account: number;
    readonly customer: number;
    readonly paymentmethod: PaymentMethod;
}

export class CreateOrder extends BackendJS.Module.Command<Context, Args, Options> {
    public readonly description = 'creates an order';
    public readonly parameters = new CoreJS.ParameterList(
        new CoreJS.NumberParameter('account', 'account id'),
        new CoreJS.NumberParameter('customer', 'customer id of order'),
        new CoreJS.NumberParameter('paymentmethod', 'order payment method', PaymentMethod.None)
    );

    public async execute(args: Args): Promise<CoreJS.Response> {
        const customer = await this.context.customerRepository.get(args.customer);

        if (!customer)
            return new CoreJS.ErrorResponse(CoreJS.ResponseCode.Forbidden, '#_customer_invalid');

        if (customer.account != args.account)
            return new CoreJS.ErrorResponse(CoreJS.ResponseCode.Forbidden, '#_permission_denied');

        const result = await this.context.orderRepository.createOrder(args.account, args.customer, args.paymentmethod);

        if (!result)
            return new CoreJS.ErrorResponse(CoreJS.ResponseCode.Forbidden, '#_order_open_already');

        return new CoreJS.JSONResponse(result);
    }
}