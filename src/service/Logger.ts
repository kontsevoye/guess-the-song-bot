import winston from "winston";
import { LoggerInterface } from "../types";

export default class Logger implements LoggerInterface {
  private logger;

  constructor() {
    this.logger = winston.createLogger({
      level: process.env.NODE_ENV !== "production" ? "debug" : "info",
      format: winston.format.json(),
      transports: [
        new winston.transports.Console({
          format:
            process.env.NODE_ENV !== "production"
              ? winston.format.simple()
              : winston.format.json(),
        }),
      ],
    });
  }

  error(message: string, ...meta: any[]): void {
    this.logger.error(message, meta);
  }

  warn(message: string, ...meta: any[]): void {
    this.logger.warn(message, meta);
  }

  info(message: string, ...meta: any[]): void {
    this.logger.info(message, meta);
  }

  http(message: string, ...meta: any[]): void {
    this.logger.http(message, meta);
  }

  verbose(message: string, ...meta: any[]): void {
    this.logger.verbose(message, meta);
  }

  debug(message: string, ...meta: any[]): void {
    this.logger.debug(message, meta);
  }

  silly(message: string, ...meta: any[]): void {
    this.logger.silly(message, meta);
  }
}
