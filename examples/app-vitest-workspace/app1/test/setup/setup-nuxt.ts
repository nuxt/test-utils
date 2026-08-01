import { registerEndpoint } from '@nuxt/test-utils/runtime'

registerEndpoint('/register/endpoint/in-setup-file', () => 'setup-file')
