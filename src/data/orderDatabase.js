import { orders, servers } from "./orders.js";

export function createOrderDatabase(SQL) {
    const database = new SQL.Database();

    database.run(`
        CREATE TABLE SERVERS (
            username TEXT,
            name TEXT NOT NULL,
            table_number INTEGER UNIQUE
        );
        CREATE TABLE ORDERS (
            order_id INTEGER PRIMARY KEY,
            table_number INTEGER NOT NULL,
            item TEXT NOT NULL
        );
    `);

    const insertServer = database.prepare("INSERT INTO SERVERS (username, name, table_number) VALUES (?, ?, ?)");
    const insertOrder = database.prepare("INSERT INTO ORDERS (order_id, table_number, item) VALUES (?, ?, ?)");

    try {
        for (const server of servers) insertServer.run([server.username, server.name, server.tableNumber]);
        for (const order of orders) insertOrder.run([order.orderId, order.tableNumber, order.item]);
    } finally {
        insertServer.free();
        insertOrder.free();
    }

    return database;
}
