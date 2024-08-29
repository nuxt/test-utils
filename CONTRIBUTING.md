
## Contributing

To contribute to Nuxt Test Utils, you need to set up a local environment.

1. [Fork](https://help.github.com/articles/fork-a-repo) the [`nuxt/test-utils`](https://github.com/nuxt/test-utils) repository to your own GitHub account and then [clone](https://help.github.com/articles/cloning-a-repository) it to your local device.
1. Enable [Corepack](https://github.com/nodejs/corepack) to have access to `pnpm`
   ```bash [Terminal]
   corepack enable
   ```
1. Run `pnpm install` to install the dependencies with pnpm:
   ```bash [Terminal]
   pnpm install && pnpm playwright install chromium
   ```
1. Activate the passive development system
   ```bash [Terminal]
   pnpm dev:prepare
   ```
1. Check out a branch where you can work and commit your changes:
   ```bash [Terminal]
   git checkout -b my-new-branch
   ```

Then, test your changes against the examples before submitting a pull request.

```bash
pnpm prepack
pnpm test:examples
pnpm dev:prepare
```

Read more in the [Nuxt Contribution Guide](https://nuxt.com/docs/community/contribution#how-to-contribute).
