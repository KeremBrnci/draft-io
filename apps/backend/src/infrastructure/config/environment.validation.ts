import { plainToInstance } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min, validateSync } from 'class-validator';

enum Environment {
  Development = 'development',
  Test = 'test',
  Production = 'production',
}

class EnvironmentVariables {
  @IsEnum(Environment)
  NODE_ENV!: Environment;

  @IsInt()
  @Min(1)
  @Max(65535)
  PORT!: number;

  @IsString()
  DATABASE_URL!: string;

  @IsString()
  REDIS_HOST!: string;

  @IsInt()
  @Min(1)
  @Max(65535)
  REDIS_PORT!: number;

  @IsOptional()
  @IsString()
  REDIS_PASSWORD?: string;

  @IsOptional()
  @IsString()
  LOG_LEVEL?: string;

  @IsOptional()
  @IsString()
  SPORTDB_API_KEY?: string;

  @IsOptional()
  @IsString()
  SPORTDB_BASE_URL?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10)
  SPORTDB_RPS_LIMIT?: number;

  @IsOptional()
  @IsInt()
  @Min(1000)
  @Max(120_000)
  SPORTDB_TIMEOUT_MS?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(5)
  SPORTDB_RETRY_ATTEMPTS?: number;

  @IsOptional()
  @IsString()
  TRANSFERMARKT_API_KEY?: string;

  @IsOptional()
  @IsString()
  TRANSFERMARKT_BASE_URL?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10)
  TRANSFERMARKT_RPS_LIMIT?: number;

  @IsOptional()
  @IsInt()
  @Min(1000)
  @Max(120_000)
  TRANSFERMARKT_TIMEOUT_MS?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(5)
  TRANSFERMARKT_RETRY_ATTEMPTS?: number;
}

export function validateEnvironment(config: Record<string, unknown>): EnvironmentVariables {
  const validated = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validated, { skipMissingProperties: false });

  if (errors.length > 0) {
    throw new Error(`Environment validation failed:\n${errors.toString()}`);
  }

  return validated;
}
