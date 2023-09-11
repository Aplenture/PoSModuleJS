/**
 * Aplenture/<my_module_name>
 * https://github.com/Aplenture/<my_module_name>
 * Copyright (c) 2023 Aplenture
 * MIT License https://github.com/Aplenture/<my_module_name>/blob/main/LICENSE
 */

import * as BackendJS from "backendjs";
import { MyRepository } from "../repositories";

export interface Context extends BackendJS.Module.Context {
    readonly myRepository: MyRepository;
}