import { Request } from 'express'
import { lookup } from 'geoip-lite'

import { SessionMetadata } from '@/src/shared/types/session-metadata.type'
import { IS_DEV_ENV } from '@/src/shared/utils/is-dev.util'

import DeviceDetector = require('device-detector-js')

export function getSessionMetadata(req: Request, userAgent: string) {
	const ip = IS_DEV_ENV
		? '173.166.164.121'
		: Array.isArray(req.headers['cf-connecting-ip'])
			? req.headers['cf-connecting-ip'][0]
			: req.headers['cf-connecting-ip'] ||
				(typeof req.headers['x-forwarded-for'] === 'string'
					? req.headers['x-forwarded-for'].split(',')[0]
					: req.ip)

	const devoce = new DeviceDetector().parse(userAgent)
	// const location = new
}
