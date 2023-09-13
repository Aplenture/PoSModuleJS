/**
 * Aplenture/PoSModuleJS
 * https://github.com/Aplenture/PoSModuleJS
 * Copyright (c) 2023 Aplenture
 * MIT License https://github.com/Aplenture/PoSModuleJS/blob/main/LICENSE
 */

import * as BackendJS from 'backendjs';
import * as CoreJS from 'corejs';
import { expect } from "chai";
import { Module } from "../src";

const args = {
    debug: true
};

const config = {
    name: "test",
    databaseConfig: {
        host: "localhost",
        user: "dev",
        password: "",
        database: "test"
    }
};

const m = new Module(args, config);
const log = BackendJS.Log.Log.createFileLog('./test.log', true);

m.onMessage.on(message => log.write(message));

describe("Module", () => {
    describe("Initialization", () => {
        it("initializes", () => m.init());
        it("updates", () => m.execute('update').then((result: any) => expect(result.code).equals(200, 'wrong response code')));
        it("resets", () => m.execute('reset').then((result: any) => expect(result.code).equals(200, 'wrong response code')));
    });

    describe("Customers", () => {
        describe("Create", () => {
            it("without nickname", async () => {
                const result = await m.execute("createCustomer", { firstname: 'hello', lastname: 'world' }) as CoreJS.JSONResponse;

                expect(result).is.not.undefined;

                const data = JSON.parse(result.data);

                expect(data).contains({ id: 1, firstname: 'hello', lastname: 'world', nickname: '' });
            });

            it("with nickname", async () => {
                const result = await m.execute("createCustomer", { firstname: 'hello', lastname: 'world', nickname: '2' }) as CoreJS.JSONResponse;

                expect(result).is.not.undefined;

                const data = JSON.parse(result.data);

                expect(data).contains({ id: 2, firstname: 'hello', lastname: 'world', nickname: '2' });
            });

            it("catches missing firstname", () => m.execute("createCustomer", { lastname: 'world' }).catch(error => expect(error).deep.contains({ code: CoreJS.CoreErrorCode.MissingParameter, data: { name: 'firstname', type: 'string' } })));
            it("catches missing lastname", () => m.execute("createCustomer", { firstname: 'hello' }).catch(error => expect(error).deep.contains({ code: CoreJS.CoreErrorCode.MissingParameter, data: { name: 'lastname', type: 'string' } })));
            it("catches duplicate", () => m.execute("createCustomer", { firstname: 'hello', lastname: 'world', nickname: '2' }).catch(error => expect(error).contains({ code: CoreJS.CoreErrorCode.Duplicate })));
        });

        describe("Get", () => {
            it("all", async () => {
                const result = await m.execute("getCustomers") as CoreJS.JSONResponse;

                expect(result).is.not.undefined;

                const data = JSON.parse(result.data);

                expect(data).has.length(2);
                expect(data[0], 'customer at 0').contains({ id: 1, firstname: 'hello', lastname: 'world', nickname: '' });
                expect(data[1], 'customer at 1').contains({ id: 2, firstname: 'hello', lastname: 'world', nickname: '2' });
            });

            it("limit 1", async () => {
                const result = await m.execute("getCustomers", { limit: 1 }) as CoreJS.JSONResponse;

                expect(result).is.not.undefined;

                const data = JSON.parse(result.data);

                expect(data).has.length(1);
                expect(data[0], 'customer at 0').contains({ id: 1, firstname: 'hello', lastname: 'world', nickname: '' });
            });

            it("first id 2", async () => {
                const result = await m.execute("getCustomers", { firstID: 2 }) as CoreJS.JSONResponse;

                expect(result).is.not.undefined;

                const data = JSON.parse(result.data);

                expect(data).has.length(1);
                expect(data[0], 'customer at 0').contains({ id: 2, firstname: 'hello', lastname: 'world', nickname: '2' });
            });

            it("last id 1", async () => {
                const result = await m.execute("getCustomers", { lastID: 1 }) as CoreJS.JSONResponse;

                expect(result).is.not.undefined;

                const data = JSON.parse(result.data);

                expect(data).has.length(1);
                expect(data[0], 'customer at 0').contains({ id: 1, firstname: 'hello', lastname: 'world', nickname: '' });
            });
        });

        describe("Edit", () => {
            it("changes firstname", () => m.execute("editCustomer", { id: 1, firstname: 'test1' })
                .then(result => expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, data: "1" }))
                .then(() => m.database.query(`SELECT * FROM ${m.customerRepository.data}`))
                .then(result => {
                    expect(result).has.length(2);
                    expect(result[0]).deep.contains({ id: 1, firstname: 'test1', lastname: 'world', nickname: '' });
                    expect(result[1]).deep.contains({ id: 2, firstname: 'hello', lastname: 'world', nickname: '2' });
                })
            );

            it("changes lastname", () => m.execute("editCustomer", { id: 2, lastname: 'test2' })
                .then(result => expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, data: "1" }))
                .then(() => m.database.query(`SELECT * FROM ${m.customerRepository.data}`))
                .then(result => {
                    expect(result).has.length(2);
                    expect(result[0]).deep.contains({ id: 1, firstname: 'test1', lastname: 'world', nickname: '' });
                    expect(result[1]).deep.contains({ id: 2, firstname: 'hello', lastname: 'test2', nickname: '2' });
                })
            );

            it("changes nickname", () => m.execute("editCustomer", { id: 1, nickname: 'test3' })
                .then(result => expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, data: "1" }))
                .then(() => m.database.query(`SELECT * FROM ${m.customerRepository.data}`))
                .then(result => {
                    expect(result).has.length(2);
                    expect(result[0]).deep.contains({ id: 1, firstname: 'test1', lastname: 'world', nickname: 'test3' });
                    expect(result[1]).deep.contains({ id: 2, firstname: 'hello', lastname: 'test2', nickname: '2' });
                })
            );
        });
    });

    describe("Products", () => {
        describe("Create", () => {
            it("without discount", async () => {
                const result = await m.execute("createProduct", { name: 'product 1', price: 100 }) as CoreJS.JSONResponse;

                expect(result).is.not.undefined;

                const data = JSON.parse(result.data);

                expect(data).contains({ id: 1, name: 'product 1', price: 100, discount: 0 });
            });

            it("with discount", async () => {
                const result = await m.execute("createProduct", { name: 'product 2', price: 150, discount: 10 }) as CoreJS.JSONResponse;

                expect(result).is.not.undefined;

                const data = JSON.parse(result.data);

                expect(data).contains({ id: 2, name: 'product 2', price: 150, discount: 10 });
            });

            it("catches missing name", () => m.execute("createProduct", { price: 100 }).catch(error => expect(error).deep.contains({ code: CoreJS.CoreErrorCode.MissingParameter, data: { name: 'name', type: 'string' } })));
            it("catches missing price", () => m.execute("createProduct", { name: 'test' }).catch(error => expect(error).deep.contains({ code: CoreJS.CoreErrorCode.MissingParameter, data: { name: 'price', type: 'number' } })));
            it("catches duplicate", () => m.execute("createProduct", { name: 'product 1', price: 100 }).catch(error => expect(error).contains({ code: CoreJS.CoreErrorCode.Duplicate })));
        });

        describe("Get", () => {
            it("all", async () => {
                const result = await m.execute("getProducts") as CoreJS.JSONResponse;

                expect(result).is.not.undefined;

                const data = JSON.parse(result.data);

                expect(data).has.length(2);
                expect(data[0], 'product at 0').contains({ id: 1, name: 'product 1', price: 100, discount: 0 });
                expect(data[1], 'product at 1').contains({ id: 2, name: 'product 2', price: 150, discount: 10 });
            });

            it("limit 1", async () => {
                const result = await m.execute("getProducts", { limit: 1 }) as CoreJS.JSONResponse;

                expect(result).is.not.undefined;

                const data = JSON.parse(result.data);

                expect(data).has.length(1);
                expect(data[0], 'product at 0').contains({ id: 1, name: 'product 1', price: 100, discount: 0 });
            });

            it("first id 2", async () => {
                const result = await m.execute("getProducts", { firstID: 2 }) as CoreJS.JSONResponse;

                expect(result).is.not.undefined;

                const data = JSON.parse(result.data);

                expect(data).has.length(1);
                expect(data[0], 'product at 0').contains({ id: 2, name: 'product 2', price: 150, discount: 10 });
            });

            it("last id 1", async () => {
                const result = await m.execute("getProducts", { lastID: 1 }) as CoreJS.JSONResponse;

                expect(result).is.not.undefined;

                const data = JSON.parse(result.data);

                expect(data).has.length(1);
                expect(data[0], 'product at 0').contains({ id: 1, name: 'product 1', price: 100, discount: 0 });
            });
        });

        describe("Edit", () => {
            it("changes name", () => m.execute("editProduct", { id: 1, name: 'test1' })
                .then(result => expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, data: "1" }))
                .then(() => m.database.query(`SELECT * FROM ${m.productRepository.data}`))
                .then(result => {
                    expect(result).has.length(2);
                    expect(result[0]).deep.contains({ name: 'test1', price: 100, discount: 0 });
                    expect(result[1]).deep.contains({ name: 'product 2', price: 150, discount: 10 });
                })
            );

            it("changes price", () => m.execute("editProduct", { id: 2, price: 200 })
                .then(result => expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, data: "1" }))
                .then(() => m.database.query(`SELECT * FROM ${m.productRepository.data}`))
                .then(result => {
                    expect(result).has.length(2);
                    expect(result[0]).deep.contains({ name: 'test1', price: 100, discount: 0 });
                    expect(result[1]).deep.contains({ name: 'product 2', price: 200, discount: 10 });
                })
            );

            it("changes discount", () => m.execute("editProduct", { id: 1, discount: 20 })
                .then(result => expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, data: "1" }))
                .then(() => m.database.query(`SELECT * FROM ${m.productRepository.data}`))
                .then(result => {
                    expect(result).has.length(2);
                    expect(result[0]).deep.contains({ name: 'test1', price: 100, discount: 20 });
                    expect(result[1]).deep.contains({ name: 'product 2', price: 200, discount: 10 });
                })
            );
        });
    });

    describe("Deinitialization", () => {
        it("reverts", () => m.execute('revert').then((result: any) => expect(result.code).equals(200, 'wrong response code')));
        it("closes", () => m.deinit());
    });
});