import { defineEventHandler } from 'h3'

// @ts-expect-error vertual file
import scans from '#test-collect-scans/scans.mjs'

export default defineEventHandler(() => scans)
