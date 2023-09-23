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
    readonly value: number;
}

export class WithdrawBalance extends BackendJS.Module.Command<Context, Args, Options> {
    public readonly description = 'decreases a balance';
    public readonly parameters = new CoreJS.ParameterList(
        new CoreJS.NumberParameter('account', 'account id'),
        new CoreJS.NumberParameter('customer', 'customer id'),
        new CoreJS.NumberParameter('value', 'amount of decrease')
    );

    public async execute(args: Args): Promise<CoreJS.Response> {
        const result = await this.context.balanceRepository.decrease({
            account: args.account,
            depot: args.customer,
            order: 0,
            asset: 1,
            value: args.value,
            data: 'withdraw'
        });

        return new CoreJS.JSONResponse(result);
    }
}