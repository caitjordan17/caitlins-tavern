import { orders } from "./orders.js";

export function createOrderDatabase(SQL) {
    const database = new SQL.Database();

    database.run(`
        CREATE TABLE orders (
            id INTEGER PRIMARY KEY,
            customer TEXT NOT NULL,
            item TEXT NOT NULL,
            table_number INTEGER NOT NULL,
            status TEXT NOT NULL,
            minutes_waiting INTEGER NOT NULL
        )
    `);

    const insert = database.prepare(`
        INSERT INTO orders (id, customer, item, table_number, status, minutes_waiting)
        VALUES (?, ?, ?, ?, ?, ?)
    `);

    try {
        for (const order of orders) {
            insert.run([
                order.id,
                order.customer,
                order.item,
                order.table,
                order.status,
                order.minutesWaiting,
            ]);
        }
    } finally {
        insert.free();
    }

    return database;
}
