type RawHandler = () => unknown | Promise<unknown>

export function defineEventHandler(handler: RawHandler): RawHandler {
  return Object.assign(handler, { __is_handler__: true }) as RawHandler
}
