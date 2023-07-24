import { importModule } from 'local-pkg'
import { EnvironmentNuxt } from '../types'

export default <EnvironmentNuxt> async function (global, { jsdom = {} }) {
  const {
    CookieJar,
    JSDOM,
    ResourceLoader,
    VirtualConsole,
  } = await importModule('jsdom') as typeof import('jsdom')
  const {
    html = '<!DOCTYPE html>',
    userAgent,
    url = 'http://localhost:3000',
    contentType = 'text/html',
    pretendToBeVisual = true,
    includeNodeLocations = false,
    runScripts = 'dangerously',
    resources,
    console = false,
    cookieJar = false,
    ...restOptions
  } = jsdom as any
  const window = new JSDOM(
    html,
    {
      pretendToBeVisual,
      resources: resources ?? (userAgent ? new ResourceLoader({ userAgent }) : undefined),
      runScripts,
      url,
      virtualConsole: console && global.console ? new VirtualConsole().sendTo(global.console) : undefined,
      cookieJar: cookieJar ? new CookieJar() : undefined,
      includeNodeLocations,
      contentType,
      userAgent,
      ...restOptions,
    },
  ).window as any

  // Vue-router relies on scrollTo being available if run in a browser.
  // The scrollTo implementation from JSDOM throws a "Not Implemented" error
  window.scrollTo = () => {}

  return {
    window,
    teardown() {}
  }
} 