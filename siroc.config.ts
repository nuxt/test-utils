import { defineSirocConfig } from 'siroc'

export default defineSirocConfig({
  rollup: {
    external: ['ohmyfetch/node']
  }
})
