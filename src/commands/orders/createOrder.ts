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
    readonly customer: number;
}

export class CreateOrder extends BackendJS.Module.Command<Context, Args, Options> {
    public readonly description = 'creates an order';
    public readonly parameters = new CoreJS.ParameterList(
        new CoreJS.NumberParameter('customer', 'customer id of order')
    );

    public async execute(args: Args): Promise<CoreJS.Response> {
        if (!await this.context.customerRepository.has(args.customer))
            return new CoreJS.ErrorResponse(CoreJS.ResponseCode.Forbidden, '#_order_invalid_customer');

        const result = await this.context.orderRepository.createOrder(args.customer);

        if (!result)
            return new CoreJS.ErrorResponse(CoreJS.ResponseCode.Forbidden, '#_order_open_already');

        return new CoreJS.JSONResponse(result);
    }
}