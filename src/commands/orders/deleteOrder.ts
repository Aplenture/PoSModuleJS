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
    readonly id: number;
}

export class DeleteOrder extends BackendJS.Module.Command<Context, Args, Options> {
    public readonly description = 'deletes an open order';
    public readonly parameters = new CoreJS.ParameterList(
        new CoreJS.NumberParameter('id', 'id of order to delete')
    );

    public async execute(args: Args): Promise<CoreJS.Response> {
        const result = await this.context.orderRepository.deleteOrder(args.id);

        return new CoreJS.BoolResponse(result);
    }
}