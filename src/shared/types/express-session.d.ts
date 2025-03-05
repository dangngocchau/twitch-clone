import 'express-session'

import { SessionMetadata } from '@/src/shared/types/session-metadata.type'

declare module 'express-session' {
	interface SessionData {
		userId?: string
		createAt?: Date | string
		metadata: SessionMetadata
	}
}
