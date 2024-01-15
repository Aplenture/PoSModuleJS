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
import { executeBonus } from "../../utils";

interface Args extends GlobalArgs {
    readonly account: number;
    readonly customer: number;
    readonly time: number;
}

export class ExecuteBonus extends BackendJS.Module.Command<Context, Args, Options> {
    public readonly description = 'calculates bonus by ordered products discounts and deposits it if balance is not negative';
    public readonly parameters = new CoreJS.ParameterList(
        new CoreJS.NumberParameter('account', 'account id'),
        new CoreJS.NumberParameter('customer', 'customer id', null),
        new CoreJS.TimeParameter('time', 'time of bonus', null)
    );

    public async execute(args: Args): Promise<CoreJS.Response> {
        if (args.customer && !await this.context.customerRepository.hasPermissions(args.account, args.customer))
            return new CoreJS.ErrorResponse(CoreJS.ResponseCode.Forbidden, '#_permission_denied');

        if (args.customer)
            await executeBonus(args.account, await this.context.customerRepository.get(args.customer), this.context, args.time);
        else
            await this.context.customerRepository.fetchAll(args.account, customer => executeBonus(args.account, customer, this.context, args.time), { paymentMethods: PaymentMethod.Balance });

        return new CoreJS.OKResponse();
    }
}