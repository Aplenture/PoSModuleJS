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
    readonly account: number;
    readonly customer: number;
}

export class RemoveCustomer extends BackendJS.Module.Command<Context, Args, Options> {
    public readonly description = 'deletes a customer';
    public readonly parameters = new CoreJS.ParameterList(
        new CoreJS.NumberParameter('account', 'account id'),
        new CoreJS.NumberParameter('customer', 'customer id')
    );

    public async execute(args: Args): Promise<CoreJS.Response> {
        const customer = await this.context.customerRepository.get(args.customer);

        if (!customer)
            return new CoreJS.ErrorResponse(CoreJS.ResponseCode.Forbidden, '#_customer_invalid');

        if (customer.account != args.account)
            return new CoreJS.ErrorResponse(CoreJS.ResponseCode.Forbidden, '#_permission_denied');

        const result = await this.context.customerRepository.delete(args.customer);

        return new CoreJS.BoolResponse(result);
    }
}