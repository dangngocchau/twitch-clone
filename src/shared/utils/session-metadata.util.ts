import { Request } from 'express'
import { lookup } from 'geoip-lite'
import * as countries from 'i18n-iso-countries'

import { SessionMetadata } from '@/src/shared/types/session-metadata.type'
import { IS_DEV_ENV } from '@/src/shared/utils/is-dev.util'

import DeviceDetector = require('device-detector-js')

// Register English locale for i18n-iso-countries
countries.registerLocale(require('i18n-iso-countries/langs/en.json'))

/**
 * This function retrieves session metadata for a user's request, including:
 * - The user's IP address.
 * - Geolocation information (country, city, latitude, longitude).
 * - Device information (browser, operating system, device type).
 *
 * @param req - The request object from Express containing information about the HTTP request.
 * @param userAgent - The User-Agent string from the user's browser.
 *
 * @returns A SessionMetadata object containing information about the user's location, device, and IP address.
 */
export function getSessionMetadata(
	req: Request,
	userAgent: string
): SessionMetadata {
	const ip = IS_DEV_ENV
		? '173.166.164.121'
		: Array.isArray(req.headers['cf-connecting-ip'])
			? req.headers['cf-connecting-ip'][0]
			: req.headers['cf-connecting-ip'] ||
				(typeof req.headers['x-forwarded-for'] === 'string'
					? req.headers['x-forwarded-for'].split(',')[0]
					: req.ip)

	const location = lookup(ip)
	const device = new DeviceDetector().parse(userAgent)

	return {
		location: {
			country: countries.getName(location.country, 'en') || 'Unknown',
			city: location.city,
			latidute: location?.ll?.[0] || 0,
			longitude: location?.ll?.[1] || 0
		},
		device: {
			browser: device.client?.name,
			os: device.os?.name,
			type: device.device?.type
		},
		ip
	}
}
