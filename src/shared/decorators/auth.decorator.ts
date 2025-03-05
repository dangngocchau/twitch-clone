import { applyDecorators, UseGuards } from '@nestjs/common'

import { GraphqlAuthGuard } from '@/src/shared/guards/graphql-auth.guard'

export function Authorization() {
	return applyDecorators(UseGuards(GraphqlAuthGuard))
}
