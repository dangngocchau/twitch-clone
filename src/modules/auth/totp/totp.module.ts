import { Module } from '@nestjs/common'

import { TotpService } from '@/src/modules/auth/totp/totp.service'

import { TotpResolver } from './totp.resolver'

@Module({
	providers: [TotpResolver, TotpService]
})
export class TotpModule {}
