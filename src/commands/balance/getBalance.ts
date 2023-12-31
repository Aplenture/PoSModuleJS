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
    readonly time: number;
}

export class GetBalance extends BackendJS.Module.Command<Context, Args, Options> {
    public readonly description = 'returns current balance of a specific customer or all customers';
    public readonly parameters = new CoreJS.ParameterList(
        new CoreJS.NumberParameter('account', 'account id'),
        new CoreJS.NumberParameter('customer', 'customer id', null),
        new CoreJS.TimeParameter('time', 'time of balance', null)
    );

    public async execute(args: Args): Promise<CoreJS.Response> {
        if (!await this.context.customerRepository.hasPermissions(args.account, args.customer))
            return new CoreJS.ErrorResponse(CoreJS.ResponseCode.Forbidden, '#_permission_denied');

        const result = await this.context.balanceRepository.getBalance(args.account, {
            asset: PaymentMethod.Balance,
            depot: args.customer,
            time: args.time
        });

        if (args.customer)
            return new CoreJS.NumberResponse(result.length && result[0].value || 0);

        return new CoreJS.JSONResponse(result.map(data => ({
            timestamp: data.timestamp,
            account: data.account,
            customer: data.depot,
            paymentMethod: data.asset,
            value: data.value
        })));
    }
}