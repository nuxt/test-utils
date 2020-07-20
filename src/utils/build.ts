import { Builder } from 'nuxt-edge'
import { getContext } from './context'

export async function build() {
  const ctx = getContext()

  ctx.builder = new Builder(ctx.nuxt)
  await ctx.builder.build()
}
