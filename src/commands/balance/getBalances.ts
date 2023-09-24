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
}

export class GetBalances extends BackendJS.Module.Command<Context, Args, Options> {
    public readonly description = 'returns balances of all customers';
    public readonly parameters = new CoreJS.ParameterList(
        new CoreJS.NumberParameter('account', 'account id')
    );

    public async execute(args: Args): Promise<CoreJS.Response> {
        const result = await this.context.balanceRepository.getUpdates(args.account, {
            asset: PaymentMethod.Balance
        });

        return new CoreJS.JSONResponse(result.map(data => ({
            timestamp: data.timestamp,
            account: data.account,
            customer: data.depot,
            paymentMethod: data.asset,
            value: data.value
        })));
    }
}