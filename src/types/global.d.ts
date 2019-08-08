import amqplib from "amqplib";

declare global {
    namespace NodeJS {
        interface Global {
            connection: amqplib.Connection;
        }
    }
}