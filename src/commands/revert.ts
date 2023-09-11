/**
 * Aplenture/PoSModuleJS
 * https://github.com/Aplenture/PoSModuleJS
 * Copyright (c) 2023 Aplenture
 * MIT License https://github.com/Aplenture/PoSModuleJS/blob/main/LICENSE
 */

import * as BackendJS from "backendjs";
import * as CoreJS from "corejs";
import { Args as GlobalArgs, Context, Options } from "../core";

interface Args extends GlobalArgs {
    readonly version: number;
}

export class Revert extends BackendJS.Module.Command<Context, Args, Options> {
    public readonly description = 'rolls back the database';
    public readonly parameters = new CoreJS.ParameterList(
        new CoreJS.NumberParameter('version', 'reverts to this version', 0)
    );

    public async execute(args: Args): Promise<CoreJS.Response> {
        await this.context.customerRepository.revert({ minVersion: args.version });
        await this.context.orderRepository.revert({ minVersion: args.version });
        const version = await this.context.productRepository.revert({ minVersion: args.version });

        return new CoreJS.TextResponse('reverted to version ' + version);
    }
}