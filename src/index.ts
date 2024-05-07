/**
 * Aplenture/PoSModuleJS
 * https://github.com/Aplenture/PoSModuleJS
 * Copyright (c) 2023 Aplenture
 * MIT License https://github.com/Aplenture/PoSModuleJS/blob/main/LICENSE
 */

import * as BackendJS from "backendjs";
import * as CoreJS from "corejs";
import { Args, Options, Context } from "./core";
import { CustomerRepository, OrderRepository, ProductRepository, LabelRepository } from "./repositories";
import { OrderTables } from "./models/orderTables";
import { BackupArgs } from "./commands";

export class Module extends BackendJS.Module.Module<Context, Args, Options> implements Context {
    public readonly allowedRequestHeaders: readonly string[] = [];

    public readonly database: BackendJS.Database.Database;
    public readonly balanceRepository: BackendJS.Balance.Repository;
    public readonly customerRepository: CustomerRepository;
    public readonly orderRepository: OrderRepository;
    public readonly productRepository: ProductRepository;
    public readonly labelRepository: LabelRepository;

    public readonly discount: number;

    private readonly closeAllOpenBalanceOrdersCronjob = new CoreJS.Cronjob(() => this.execute("closeAllOpenBalanceOrders", { account: 2 }), { days: 1 }, CoreJS.addDate({ days: 1, minutes: -1 }));
    private readonly executeBonusCronjob = new CoreJS.Cronjob(() => this.execute("executeBonus", { account: 2 }), { months: 1 }, CoreJS.calcDate({ monthDay: 1 }));
    private readonly backupCronjob: CoreJS.Cronjob;

    constructor(app: BackendJS.Module.IApp, args: BackendJS.Module.Args, options: Options, ...params: CoreJS.Parameter<any>[]) {
        super(app, args, options, ...params,
            new CoreJS.NumberParameter('discount', 'discount of bonus payment'),
            new CoreJS.DictionaryParameter('databaseConfig', 'database config', BackendJS.Database.Parameters),
            new CoreJS.StringParameter('customerTable', 'database table customer name', '`customers`'),
            new CoreJS.StringParameter('productTable', 'database table product name', '`products`'),
            new CoreJS.StringParameter('labelTable', 'database table labels', '`labels`'),
            new CoreJS.DictionaryParameter<OrderTables>('orderTables', 'database table order names', [
                new CoreJS.StringParameter('orders', 'database table order name', '`orders`'),
                new CoreJS.StringParameter('products', 'database table order product name', '`orderProducts`')
            ], {
                orders: '`orders`',
                products: '`orderProducts`'
            }),
            new CoreJS.DictionaryParameter<BackendJS.Balance.Tables>('balanceTables', 'database table order names', [
                new CoreJS.StringParameter('balanceTable', 'database table order name', '`balances`'),
                new CoreJS.StringParameter('updateTable', 'database table order product name', '`balanceUpdates`'),
                new CoreJS.StringParameter('historyTable', 'database table order product name', '`balanceHistories`')
            ], {
                eventTable: '`balanceEvents`',
                updateTable: '`balanceUpdates`'
            }),
            new CoreJS.DictionaryParameter<BackupArgs>('backup', 'backup config', [
                new CoreJS.StringParameter("user", "database user"),
                new CoreJS.StringParameter("password", "database password", ""),
                new CoreJS.StringParameter("database", "database name"),
                new CoreJS.StringParameter("directory", "path where to store the backup files", "backup/")
            ])
        );

        this.database = new BackendJS.Database.Database(this.options.databaseConfig, {
            debug: args.debug,
            multipleStatements: true
        }, app);

        this.balanceRepository = new BackendJS.Balance.Repository(this.options.balanceTables, this.database);
        this.customerRepository = new CustomerRepository(this.options.customerTable, this.database, __dirname + '/updates/' + CustomerRepository.name);
        this.orderRepository = new OrderRepository(this.options.orderTables, this.database, __dirname + '/updates/' + OrderRepository.name);
        this.productRepository = new ProductRepository(this.options.productTable, this.database, __dirname + '/updates/' + ProductRepository.name);
        this.labelRepository = new LabelRepository(this.options.labelTable, this.database, __dirname + '/updates/' + LabelRepository.name);

        this.discount = this.options.discount;

        this.backupCronjob = new CoreJS.Cronjob(() => this.execute("backup", this.options.backup), { days: 1 }, CoreJS.calcDate());

        this.addCommands(Object.values(require('./commands')).map((constructor: any) => new constructor(this)));

        this.closeAllOpenBalanceOrdersCronjob.onExecute.on(next => app.onMessage.emit(this, `closing all open balance orders (next update: ${new Date(next).toLocaleString()})`));
        this.executeBonusCronjob.onExecute.on(next => app.onMessage.emit(this, `executing bonus payment (next update: ${new Date(next).toLocaleString()})`));
        this.backupCronjob.onExecute.on(next => app.onMessage.emit(this, `database backup created (next update: ${new Date(next).toLocaleString()})`));
    }

    public async init(): Promise<void> {
        await BackendJS.Database.Database.create(this.options.databaseConfig);
        await this.database.init();
        await super.init();

        this.app.updateLoop.add(this.closeAllOpenBalanceOrdersCronjob, true);
        this.app.updateLoop.add(this.executeBonusCronjob, true);
        this.app.updateLoop.add(this.backupCronjob, true);
    }

    public async deinit(): Promise<void> {
        await this.database.close();
        await super.deinit();

        this.app.updateLoop.remove(this.closeAllOpenBalanceOrdersCronjob, true);
        this.app.updateLoop.remove(this.executeBonusCronjob, true);
        this.app.updateLoop.remove(this.backupCronjob, true);
    }
}