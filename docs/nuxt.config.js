import { withDocus } from 'docus'

export default withDocus({
  generate: {
    fallback: '404.html',
    routes: ['/']
  }
})
