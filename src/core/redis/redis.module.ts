import { Global, Module } from '@nestjs/common'

import { RedisController } from './redis.controller'
import { RedisService } from './redis.service'

@Global()
@Module({
	providers: [RedisService],
	exports: [RedisService]
})
export class RedisModule {}
