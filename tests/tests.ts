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
import { OrderState, PaymentMethod } from '../src/enums';

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

                expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, type: CoreJS.ResponseType.JSON });

                const data = JSON.parse(result.data);

                expect(data).contains({ id: 1, firstname: 'hello', lastname: 'world', nickname: '', paymentMethods: -1 });
            });

            it("with nickname", async () => {
                const result = await m.execute("createCustomer", { firstname: 'hello', lastname: 'world', nickname: '2' }) as CoreJS.JSONResponse;

                expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, type: CoreJS.ResponseType.JSON });

                const data = JSON.parse(result.data);

                expect(data).contains({ id: 2, firstname: 'hello', lastname: 'world', nickname: '2', paymentMethods: -1 });
            });

            it("with payment method balance", async () => {
                const result = await m.execute("createCustomer", { firstname: 'with', lastname: 'payment method', nickname: 'balance', paymentMethods: PaymentMethod.Balance }) as CoreJS.JSONResponse;

                expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, type: CoreJS.ResponseType.JSON });

                const data = JSON.parse(result.data);

                expect(data).contains({ id: 3, firstname: 'with', lastname: 'payment method', nickname: 'balance', paymentMethods: PaymentMethod.Balance });
            });

            it("with payment method balance and cash", async () => {
                const result = await m.execute("createCustomer", { firstname: 'with', lastname: 'payment method', nickname: 'balance+cash', paymentMethods: PaymentMethod.Balance | PaymentMethod.Cash }) as CoreJS.JSONResponse;

                expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, type: CoreJS.ResponseType.JSON });

                const data = JSON.parse(result.data);

                expect(data).contains({ id: 4, firstname: 'with', lastname: 'payment method', nickname: 'balance+cash', paymentMethods: PaymentMethod.Balance | PaymentMethod.Cash });
            });

            it("catches missing firstname", () => m.execute("createCustomer", { lastname: 'world' }).catch(error => expect(error).deep.contains({ code: CoreJS.CoreErrorCode.MissingParameter, data: { name: 'firstname', type: 'string' } })));
            it("catches missing lastname", () => m.execute("createCustomer", { firstname: 'hello' }).catch(error => expect(error).deep.contains({ code: CoreJS.CoreErrorCode.MissingParameter, data: { name: 'lastname', type: 'string' } })));
            it("catches duplicate", () => m.execute("createCustomer", { firstname: 'hello', lastname: 'world', nickname: '2' }).catch(error => expect(error).contains({ code: CoreJS.CoreErrorCode.Duplicate })));
        });

        describe("Edit", () => {
            it("changes firstname", () => m.execute("editCustomer", { id: 1, firstname: 'test1' }).then(result => expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, data: "1" })));
            it("changes lastname", () => m.execute("editCustomer", { id: 3, lastname: 'test2' }).then(result => expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, data: "1" })));
            it("changes nickname", () => m.execute("editCustomer", { id: 4, nickname: 'test3' }).then(result => expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, data: "1" })));
            it("catches missing id", () => m.execute("editCustomer", { lastname: 'world' }).catch(error => expect(error).deep.contains({ code: CoreJS.CoreErrorCode.MissingParameter, data: { name: 'id', type: 'number' } })));
        });

        describe("Delete", () => {
            it("second entity", () => m.execute("deleteCustomer", { id: 2 }).then(result => expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, data: "1" })));
            it("catches missing id", () => m.execute("deleteCustomer").catch(error => expect(error).deep.contains({ code: CoreJS.CoreErrorCode.MissingParameter, data: { name: 'id', type: 'number' } })));
        });

        describe("Get", () => {
            it("all", async () => {
                const result = await m.execute("getCustomers") as CoreJS.JSONResponse;

                expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, type: CoreJS.ResponseType.JSON });

                const data = JSON.parse(result.data);

                expect(data).has.length(3);
                expect(data[0], 'customer at 0').contains({ id: 1, firstname: 'test1', lastname: 'world', nickname: '', paymentMethods: -1 });
                expect(data[1], 'customer at 1').contains({ id: 3, firstname: 'with', lastname: 'test2', nickname: 'balance', paymentMethods: PaymentMethod.Balance });
                expect(data[2], 'customer at 2').contains({ id: 4, firstname: 'with', lastname: 'payment method', nickname: 'test3', paymentMethods: PaymentMethod.Balance | PaymentMethod.Cash });
            });

            it("limit 2", async () => {
                const result = await m.execute("getCustomers", { limit: 2 }) as CoreJS.JSONResponse;

                expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, type: CoreJS.ResponseType.JSON });

                const data = JSON.parse(result.data);

                expect(data).has.length(2);
                expect(data[0], 'customer at 0').contains({ id: 1, firstname: 'test1', lastname: 'world', nickname: '', paymentMethods: -1 });
                expect(data[1], 'customer at 1').contains({ id: 3, firstname: 'with', lastname: 'test2', nickname: 'balance', paymentMethods: PaymentMethod.Balance });
            });

            it("first id 3", async () => {
                const result = await m.execute("getCustomers", { firstID: 3 }) as CoreJS.JSONResponse;

                expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, type: CoreJS.ResponseType.JSON });

                const data = JSON.parse(result.data);

                expect(data).has.length(2);
                expect(data[0], 'customer at 0').contains({ id: 3, firstname: 'with', lastname: 'test2', nickname: 'balance', paymentMethods: PaymentMethod.Balance });
                expect(data[1], 'customer at 1').contains({ id: 4, firstname: 'with', lastname: 'payment method', nickname: 'test3', paymentMethods: PaymentMethod.Balance | PaymentMethod.Cash });
            });

            it("last id 3", async () => {
                const result = await m.execute("getCustomers", { lastID: 3 }) as CoreJS.JSONResponse;

                expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, type: CoreJS.ResponseType.JSON });

                const data = JSON.parse(result.data);

                expect(data).has.length(2);
                expect(data[0], 'customer at 0').contains({ id: 1, firstname: 'test1', lastname: 'world', nickname: '', paymentMethods: -1 });
                expect(data[1], 'customer at 1').contains({ id: 3, firstname: 'with', lastname: 'test2', nickname: 'balance', paymentMethods: PaymentMethod.Balance });
            });
        });
    });

    describe("Products", () => {
        describe("Create", () => {
            it("without discount", async () => {
                const result = await m.execute("createProduct", { name: 'product 1', price: 100 }) as CoreJS.JSONResponse;

                expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, type: CoreJS.ResponseType.JSON });

                const data = JSON.parse(result.data);

                expect(data).contains({ id: 1, name: 'product 1', price: 100, discount: 0 });
            });

            it("with discount", async () => {
                const result = await m.execute("createProduct", { name: 'product 2', price: 150, discount: 10 }) as CoreJS.JSONResponse;

                expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, type: CoreJS.ResponseType.JSON });

                const data = JSON.parse(result.data);

                expect(data).contains({ id: 2, name: 'product 2', price: 150, discount: 10 });
            });

            it("third", async () => {
                const result = await m.execute("createProduct", { name: 'product 3', price: 150, discount: 10 }) as CoreJS.JSONResponse;

                expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, type: CoreJS.ResponseType.JSON });

                const data = JSON.parse(result.data);

                expect(data).contains({ id: 3, name: 'product 3', price: 150, discount: 10 });
            });

            it("fourth", async () => {
                const result = await m.execute("createProduct", { name: 'product 4', price: 150, discount: 10 }) as CoreJS.JSONResponse;

                expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, type: CoreJS.ResponseType.JSON });

                const data = JSON.parse(result.data);

                expect(data).contains({ id: 4, name: 'product 4', price: 150, discount: 10 });
            });

            it("catches missing name", () => m.execute("createProduct", { price: 100 }).catch(error => expect(error).deep.contains({ code: CoreJS.CoreErrorCode.MissingParameter, data: { name: 'name', type: 'string' } })));
            it("catches missing price", () => m.execute("createProduct", { name: 'test' }).catch(error => expect(error).deep.contains({ code: CoreJS.CoreErrorCode.MissingParameter, data: { name: 'price', type: 'number' } })));
            it("catches duplicate", () => m.execute("createProduct", { name: 'product 1', price: 100 }).catch(error => expect(error).contains({ code: CoreJS.CoreErrorCode.Duplicate })));
        });

        describe("Edit", () => {
            it("changes name", () => m.execute("editProduct", { id: 1, name: 'test1' }).then(result => expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, data: "1" })));
            it("changes price", () => m.execute("editProduct", { id: 3, price: 200 }).then(result => expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, data: "1" })));
            it("changes discount", () => m.execute("editProduct", { id: 4, discount: 20 }).then(result => expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, data: "1" })));
            it("catches missing id", () => m.execute("editProduct", { name: 'test1', price: 100 }).catch(error => expect(error).deep.contains({ code: CoreJS.CoreErrorCode.MissingParameter, data: { name: 'id', type: 'number' } })));
        });

        describe("Delete", () => {
            it("second entity", () => m.execute("deleteProduct", { id: 2 }).then(result => expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, data: "1" })));
            it("catches missing id", () => m.execute("deleteProduct").catch(error => expect(error).deep.contains({ code: CoreJS.CoreErrorCode.MissingParameter, data: { name: 'id', type: 'number' } })));
        });

        describe("Get", () => {
            it("all", async () => {
                const result = await m.execute("getProducts") as CoreJS.JSONResponse;

                expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, type: CoreJS.ResponseType.JSON });

                const data = JSON.parse(result.data);

                expect(data).has.length(3);
                expect(data[0], 'product at 0').contains({ id: 1, name: 'test1', price: 100, discount: 0 });
                expect(data[1], 'product at 1').contains({ id: 3, name: 'product 3', price: 200, discount: 10 });
                expect(data[2], 'product at 2').contains({ id: 4, name: 'product 4', price: 150, discount: 20 });
            });

            it("limit 2", async () => {
                const result = await m.execute("getProducts", { limit: 2 }) as CoreJS.JSONResponse;

                expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, type: CoreJS.ResponseType.JSON });

                const data = JSON.parse(result.data);

                expect(data).has.length(2);
                expect(data[0], 'product at 0').contains({ id: 1, name: 'test1', price: 100, discount: 0 });
                expect(data[1], 'product at 1').contains({ id: 3, name: 'product 3', price: 200, discount: 10 });
            });

            it("first id 3", async () => {
                const result = await m.execute("getProducts", { firstID: 3 }) as CoreJS.JSONResponse;

                expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, type: CoreJS.ResponseType.JSON });

                const data = JSON.parse(result.data);

                expect(data).has.length(2);
                expect(data[0], 'product at 0').contains({ id: 3, name: 'product 3', price: 200, discount: 10 });
                expect(data[1], 'product at 1').contains({ id: 4, name: 'product 4', price: 150, discount: 20 });
            });

            it("last id 3", async () => {
                const result = await m.execute("getProducts", { lastID: 3 }) as CoreJS.JSONResponse;

                expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, type: CoreJS.ResponseType.JSON });

                const data = JSON.parse(result.data);

                expect(data).has.length(2);
                expect(data[0], 'product at 0').contains({ id: 1, name: 'test1', price: 100, discount: 0 });
                expect(data[1], 'product at 1').contains({ id: 3, name: 'product 3', price: 200, discount: 10 });
            });
        });
    });

    describe("Orders", () => {
        describe("Create Order", () => {
            it("creates for customer 1", async () => {
                const result = await m.execute("createOrder", { customer: 1 }) as CoreJS.Response;

                expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, type: CoreJS.ResponseType.JSON });

                const data = JSON.parse(result.data);

                expect(data).deep.contains({ id: 1, state: OrderState.Open, customer: 1, paymentMethod: PaymentMethod.None, tip: 0 });
            });

            it("creates for customer 3", async () => {
                const result = await m.execute("createOrder", { customer: 3 }) as CoreJS.Response;

                expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, type: CoreJS.ResponseType.JSON });

                const data = JSON.parse(result.data);

                expect(data).deep.contains({ id: 2, state: OrderState.Open, customer: 3, paymentMethod: PaymentMethod.None, tip: 0 });
            });

            it("creates for customer 4", async () => {
                const result = await m.execute("createOrder", { customer: 4 }) as CoreJS.Response;

                expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, type: CoreJS.ResponseType.JSON });

                const data = JSON.parse(result.data);

                expect(data).deep.contains({ id: 3, state: OrderState.Open, customer: 4, paymentMethod: PaymentMethod.None, tip: 0 });
            });

            it("catches missing customer", () => m.execute("createOrder").catch(error => expect(error).deep.contains({ code: CoreJS.CoreErrorCode.MissingParameter, data: { name: "customer", type: "number" } })));
            it("catches deleted customer", () => m.execute("createOrder", { customer: 2 }).then(result => expect(result).deep.contains({ code: CoreJS.ResponseCode.Forbidden, data: "#_order_invalid_customer" })));
            it("catches currently open order", () => m.execute("createOrder", { customer: 1 }).then(result => expect(result).deep.contains({ code: CoreJS.ResponseCode.Forbidden, data: "#_order_open_already" })));
        });

        describe("Order Product", () => {
            it("orders product 1 for customer 1", async () => {
                const result = await m.execute("order", { order: 1, product: 1 }) as CoreJS.Response;

                expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, type: CoreJS.ResponseType.JSON });

                const data = JSON.parse(result.data);

                expect(data).deep.contains({ order: 1, product: 1, price: 100, amount: 1 });
            });

            it("orders product 1 for customer 1 with amount 9", async () => {
                const result = await m.execute("order", { order: 1, product: 1, amount: 9 }) as CoreJS.Response;

                expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, type: CoreJS.ResponseType.JSON });

                const data = JSON.parse(result.data);

                expect(data).deep.contains({ order: 1, product: 1, price: 100, amount: 10 });
            });

            it("orders product 1 for customer 3", async () => {
                const result = await m.execute("order", { order: 2, product: 1 }) as CoreJS.Response;

                expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, type: CoreJS.ResponseType.JSON });

                const data = JSON.parse(result.data);

                expect(data).deep.contains({ order: 2, product: 1, price: 100 });
            });

            it("orders product 3 for customer 4 with amount 10", async () => {
                const result = await m.execute("order", { order: 3, product: 3, amount: 10 }) as CoreJS.Response;

                expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, type: CoreJS.ResponseType.JSON });

                const data = JSON.parse(result.data);

                expect(data).deep.contains({ order: 3, product: 3, price: 180, amount: 10 });
            });

            it("orders product 4 for customer 4 with amount 10 and without discount", async () => {
                const result = await m.execute("order", { order: 3, product: 4, amount: 10, discount: false }) as CoreJS.Response;

                expect(result).deep.contains({ code: CoreJS.ResponseCode.OK, type: CoreJS.ResponseType.JSON });

                const data = JSON.parse(result.data);

                expect(data).deep.contains({ order: 3, product: 4, price: 150, amount: 10 });
            });

            it("catches missing order", () => m.execute("order", { product: 1 }).catch(error => expect(error).deep.contains({ code: CoreJS.CoreErrorCode.MissingParameter, data: { name: "order", type: "number" } })));
            it("catches invalid order", () => m.execute("order", { order: 4, product: 1 }).then(result => expect(result).deep.contains({ code: CoreJS.ResponseCode.Forbidden, data: "#_order_invalid" })));
            it("catches missing product", () => m.execute("order", { order: 1 }).catch(error => expect(error).deep.contains({ code: CoreJS.CoreErrorCode.MissingParameter, data: { name: "product", type: "number" } })));
            it("catches deleted product", () => m.execute("order", { order: 1, product: 2 }).then(result => expect(result).deep.contains({ code: CoreJS.ResponseCode.Forbidden, data: "#_order_invalid_product" })));
        });
    });

    describe("Deinitialization", () => {
        it("reverts", () => m.execute('revert').then((result: any) => expect(result.code).equals(200, 'wrong response code')));
        it("closes", () => m.deinit());
    });
});