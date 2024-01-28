export const add = (...args: number[]) => {
  return args.reduce((a, b) => a + b, 0)
}
