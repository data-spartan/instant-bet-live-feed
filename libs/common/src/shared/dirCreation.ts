import { Injectable, OnModuleInit } from '@nestjs/common';
import { mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import { ConfigService } from '@nestjs/config';
// import { LoggerService } from 'src/common/logger/logger.service';

@Injectable()
export class DirectoryCreationService implements OnModuleInit {
  constructor(
    private readonly configService: ConfigService, // private readonly logger: LoggerService,
  ) {}

  onModuleInit() {
    // Get the base directory path from configuration
    const baseDir = this.configService.get<string>('APP_BASE_DIR');
    const logsDir = this.configService.get<string>('LOG_DIR');

    const dirPath = join(baseDir, logsDir);
    if (!existsSync(dirPath)) {
      mkdirSync(dirPath, { recursive: true });
    }
  }
}
