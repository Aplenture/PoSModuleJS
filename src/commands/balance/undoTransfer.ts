/**
 * Aplenture/PoSModuleJS
 * https://github.com/Aplenture/PoSModuleJS
 * Copyright (c) 2023 Aplenture
 * MIT License https://github.com/Aplenture/PoSModuleJS/blob/main/LICENSE
 */

import * as BackendJS from "backendjs";
import * as CoreJS from "corejs";
import { Args as GlobalArgs, Context, Options } from "../../core";
import { BalanceEvent, OrderState, PaymentMethod } from "../../enums";

const MAX_DURATION = CoreJS.Milliseconds.Day * 32; // one more than highest month lenght

interface Args extends GlobalArgs {
    readonly account: number;
    readonly id: number;
}

export class UndoTransfer extends BackendJS.Module.Command<Context, Args, Options> {
    public readonly description = 'removes a deposit or withdraw';
    public readonly parameters = new CoreJS.ParameterList(
        new CoreJS.NumberParameter('account', 'account id'),
        new CoreJS.NumberParameter('id', 'of the transfer to remove')
    );

    public async execute(args: Args): Promise<CoreJS.Response> {
        const transfer = await this.context.balanceRepository.getEventWithID(args.id);

        if (transfer.account != args.account)
            return new CoreJS.ErrorResponse(CoreJS.ResponseCode.Forbidden, '#_permission_denied');

        const transactionLabels = await this.context.transactionLabelRepository.getAll(args.account);
        const transactionDatas = [BalanceEvent.Deposit as string, BalanceEvent.Withdraw as string].concat(transactionLabels.map(data => data.name));

        if (!transactionDatas.includes(transfer.data))
            return new CoreJS.ErrorResponse(CoreJS.ResponseCode.Forbidden, '#_transaction_data_invalid');

        const result = await this.context.balanceRepository.removeEvent(args.id);

        return new CoreJS.JSONResponse({
            timestamp: result.timestamp,
            account: result.account,
            customer: result.depot,
            paymentMethod: result.asset,
            value: result.value
        });
    }
}