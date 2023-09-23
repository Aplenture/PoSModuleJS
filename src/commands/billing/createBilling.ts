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
}

export class CreateBilling extends BackendJS.Module.Command<Context, Args, Options> {
    public readonly description = 'creates a new billing';
    public readonly parameters = new CoreJS.ParameterList();

    public async execute(args: Args): Promise<CoreJS.Response> {
        const result = await this.context.balanceRepository.updateHistory();

        return new CoreJS.BoolResponse(result);
    }
}