import * as BackendJS from "backendjs";
import * as CoreJS from "corejs";
import { Customer } from "../models";
import { BalanceEvent, OrderState, PaymentMethod } from "../enums";
import { Context } from "../core";

export async function executeBonus(account: number, customer: Customer, context: Context, time?: number): Promise<BackendJS.Balance.Update | null> {
    const firstDayOfCurrentMonth = CoreJS.calcDate({ monthDay: 1 });
    const firstDayOfStartMonth = time
        ? CoreJS.calcDate({ date: new Date(time), monthDay: 1 })
        : CoreJS.reduceDate({ date: firstDayOfCurrentMonth, months: 1 });

    let result: BackendJS.Balance.Update = null;

    for (let start = firstDayOfStartMonth, end = CoreJS.addDate({ date: start, months: 1 }); start < firstDayOfCurrentMonth; start = end, end = CoreJS.addDate({ date: start, months: 1 })) {
        // get paid out bonus
        const paidBonus = await context.balanceRepository.getEvents(account, {
            start: Number(start),
            end: Number(end),
            depot: customer.id,
            data: BalanceEvent.Bonus
        });

        // skip bonus that has already been paid out
        if (0 < paidBonus.length)
            continue;

        // get balance at end of month
        const balance = await context.balanceRepository.getBalance(account, {
            time: Number(end),
            depot: customer.id,
            asset: PaymentMethod.Balance
        });

        // if there is no balance for customer
        // the customer has no orders
        if (0 == balance.length)
            continue;

        // skip bonus if balance is negative
        if (0 > balance[0].value)
            continue;

        let bonus = 0;

        // caluclate bonus by orders of month
        await context.orderRepository.fetchOrders(account, async order => bonus += CoreJS.Currency.percentage(await context.orderRepository.getInvoice(order.id), context.discount), {
            customer: customer.id,
            start: Number(start),
            end: Number(end),
            state: OrderState.Closed,
            paymentMethod: PaymentMethod.Balance
        });

        // skip if there is no bonus
        if (0 == bonus)
            continue;

        // catch negative bonus
        if (0 > bonus)
            throw new Error(`${customer.id} received negative bonus (${bonus}) at ${start} - ${end}`);

        // pay out bonus
        result = await context.balanceRepository.increase({
            date: CoreJS.reduceDate({ date: end, milliseconds: 1 }),
            account: account,
            depot: customer.id,
            order: 0,
            asset: PaymentMethod.Balance,
            value: bonus,
            data: BalanceEvent.Bonus
        });
    }

    return result;
}