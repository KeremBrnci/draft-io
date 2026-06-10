import { Injectable, LoggerService as NestLoggerService, LogLevel } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class LoggerService implements NestLoggerService {
  private readonly logLevel: LogLevel;

  constructor(private readonly configService: ConfigService) {
    this.logLevel = this.configService.get<LogLevel>('LOG_LEVEL', 'log');
  }

  log(message: string, context?: string): void {
    this.write('log', message, context);
  }

  error(message: string, trace?: string, context?: string): void {
    const entry: Record<string, unknown> = {
      timestamp: new Date().toISOString(),
      level: 'error',
      message,
    };

    if (context !== undefined) {
      entry.module = context;
    }

    if (trace !== undefined) {
      entry.trace = trace;
    }

    if (!this.shouldLog('error')) {
      return;
    }

    console.error(JSON.stringify(entry));
  }

  warn(message: string, context?: string): void {
    this.write('warn', message, context);
  }

  debug(message: string, context?: string): void {
    this.write('debug', message, context);
  }

  verbose(message: string, context?: string): void {
    this.write('verbose', message, context);
  }

  private write(level: LogLevel, message: string, context?: string): void {
    if (!this.shouldLog(level)) {
      return;
    }

    const entry: Record<string, unknown> = {
      timestamp: new Date().toISOString(),
      level,
      message,
    };

    if (context !== undefined) {
      entry.module = context;
    }

    const output = JSON.stringify(entry);

    if (level === 'warn') {
      console.warn(output);
      return;
    }

    process.stdout.write(`${output}\n`);
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ['verbose', 'debug', 'log', 'warn', 'error'];
    const currentIndex = levels.indexOf(this.logLevel);
    const messageIndex = levels.indexOf(level);
    return messageIndex >= currentIndex;
  }
}
