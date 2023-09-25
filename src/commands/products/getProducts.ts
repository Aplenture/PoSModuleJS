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
    readonly firstID: number;
    readonly lastID: number;
}

export class GetProducts extends BackendJS.Module.Command<Context, Args, Options> {
    public readonly description = 'returns all products';
    public readonly parameters = new CoreJS.ParameterList(
        new CoreJS.NumberParameter('account', 'account id'),
        new CoreJS.NumberParameter('firstID', 'id of first returning product', null),
        new CoreJS.NumberParameter('lastID', 'id of last returned product', null)
    );

    public async execute(args: Args): Promise<CoreJS.Response> {
        const result = await this.context.productRepository.getAll(args.account, args);

        return new CoreJS.JSONResponse(result);
    }
}