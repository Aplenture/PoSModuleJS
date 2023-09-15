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
    readonly firstname: string;
    readonly lastname: string;
    readonly nickname: string;
}

export class EditCustomer extends BackendJS.Module.Command<Context, Args, Options> {
    public readonly description = 'changes the properties of a customer';
    public readonly parameters = new CoreJS.ParameterList(
        new CoreJS.NumberParameter('account', 'account id'),
        new CoreJS.NumberParameter('customer', 'customer id'),
        new CoreJS.StringParameter('firstname', 'firstname of customer', null),
        new CoreJS.StringParameter('lastname', 'lastname of customer', null),
        new CoreJS.StringParameter('nickname', 'nickname of customer', null)
    );

    public async execute(args: Args): Promise<CoreJS.Response> {
        const customer = await this.context.customerRepository.get(args.customer);

        if (!customer)
            return new CoreJS.ErrorResponse(CoreJS.ResponseCode.Forbidden, '#_customer_invalid');

        if (customer.account != args.account)
            return new CoreJS.ErrorResponse(CoreJS.ResponseCode.Forbidden, '#_permission_denied');

        const result = await this.context.customerRepository.edit(args.customer, args);

        return new CoreJS.BoolResponse(result);
    }
}