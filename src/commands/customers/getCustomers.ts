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
    readonly limit: number;
    readonly firstID: number;
    readonly lastID: number;
}

export class GetCustomers extends BackendJS.Module.Command<Context, Args, Options> {
    public readonly description = 'returns all customers';
    public readonly parameters = new CoreJS.ParameterList(
        new CoreJS.NumberParameter('limit', 'max number of returning customers', 1000),
        new CoreJS.NumberParameter('firstID', 'customer id of first returning customer', null),
        new CoreJS.NumberParameter('lastID', 'customer id of last returned customer', null)
    );

    public async execute(args: Args): Promise<CoreJS.Response> {
        const result = await this.context.customerRepository.getAll(args);

        return new CoreJS.JSONResponse(result);
    }
}