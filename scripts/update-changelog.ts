import { execSync } from 'node:child_process'
import { promises as fsp } from 'node:fs'
import { join, resolve } from 'node:path'
import process from 'node:process'
import type { ResolvedChangelogConfig } from 'changelogen'

import { determineSemverChange, generateMarkDown, getCurrentGitBranch, getGitDiff, loadChangelogConfig, parseCommits } from 'changelogen'
import { inc } from 'semver'

const repo = `nuxt/test-utils`
const corePackage = '@nuxt/test-utils'
const ignoredPackages: string[] = ['vitest-environment-nuxt']
const user = {
  name: 'Daniel Roe',
  email: 'daniel@roe.dev',
}

async function main() {
  const releaseBranch = getCurrentGitBranch()
  const workspace = await loadWorkspace(process.cwd())
  const config = await loadChangelogConfig(process.cwd(), {})

  const commits = await getLatestCommits(config).then(commits => commits.filter(c => config.types[c.type] && !(c.type === 'chore' && c.scope === 'deps' && !c.isBreaking)))
  const bumpType = (await determineBumpType(config)) || 'patch'

  const newVersion = inc(workspace.find(corePackage).data.version, bumpType)
  const changelog = await generateMarkDown(commits, config)

  // Create and push a branch with bumped versions if it has not already been created
  const branchExists = execSync(`git ls-remote --heads origin v${newVersion}`).toString().trim().length > 0
  if (!branchExists) {
    for (const [key, value] of Object.entries(user)) {
      execSync(`git config --global user.${key} "${value}"`)
      execSync(`git config --global user.${key} "${value}"`)
    }
    execSync(`git checkout -b v${newVersion}`)

    for (const pkg of workspace.packages.filter(p => !p.data.private)) {
      workspace.setVersion(pkg.data.name, newVersion!)
    }
    await workspace.save()

    execSync(`git commit -am v${newVersion}`)
    execSync(`git push -u origin v${newVersion}`)
  }

  // Get the current PR for this release, if it exists
  const [currentPR] = await fetch(`https://api.github.com/repos/${repo}/pulls?head=nuxt:v${newVersion}`).then(r => r.json())
  const contributors = await getContributors()

  const releaseNotes = [
    currentPR?.body.replace(/## 👉 Changelog[\s\S]*$/, '') || `> ${newVersion} is the next ${bumpType} release.\n>\n> **Timetable**: to be announced.`,
    '## 👉 Changelog',
    changelog
      .replace(/^## v.*\n/, '')
      .replace(`...${releaseBranch}`, `...v${newVersion}`)
      .replace(/### ❤️ Contributors[\s\S]*$/, ''),
    '### ❤️ Contributors',
    contributors.map(c => `- ${c.name} (@${c.username})`).join('\n'),
  ].join('\n')

  // Create a PR with release notes if none exists
  if (!currentPR) {
    return await fetch(`https://api.github.com/repos/${repo}/pulls`, {
      method: 'POST',
      headers: {
        'Authorization': `token ${process.env.GITHUB_TOKEN}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        title: `v${newVersion}`,
        head: `v${newVersion}`,
        base: releaseBranch,
        body: releaseNotes,
        draft: true,
      }),
    })
  }

  // Update release notes if the pull request does exist
  await fetch(`https://api.github.com/repos/${repo}/pulls/${currentPR.number}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `token ${process.env.GITHUB_TOKEN}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      body: releaseNotes,
    }),
  })
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})

export interface Dep {
  name: string
  range: string
  type: string
}

type ThenArg<T> = T extends PromiseLike<infer U> ? U : T
export type Package = ThenArg<ReturnType<typeof loadPackage>>

export async function loadPackage(dir: string) {
  const pkgPath = resolve(dir, 'package.json')
  const data = JSON.parse(await fsp.readFile(pkgPath, 'utf-8').catch(() => '{}'))
  const save = () => fsp.writeFile(pkgPath, `${JSON.stringify(data, null, 2)}\n`)

  const updateDeps = (reviver: (dep: Dep) => Dep | void) => {
    for (const type of ['dependencies', 'devDependencies', 'optionalDependencies', 'peerDependencies']) {
      if (!data[type]) {
        continue
      }
      for (const e of Object.entries(data[type])) {
        const dep: Dep = { name: e[0], range: e[1] as string, type }
        // eslint-disable-next-line
        delete data[type][dep.name]
        const updated = reviver(dep) || dep
        data[updated.type] = data[updated.type] || {}
        data[updated.type][updated.name] = updated.range
      }
    }
  }

  return {
    dir,
    data,
    save,
    updateDeps,
  }
}

export async function loadWorkspace(dir: string) {
  const workspacePkg = await loadPackage(dir)

  const packages: Package[] = []

  async function addWorkspace(dir: string) {
    const pkg = await loadPackage(dir)
    if (!pkg.data.name || pkg.data.private || ignoredPackages.includes(pkg.data.name)) {
      return
    }
    console.log(pkg.data.name)
    packages.push(pkg)
  }

  await addWorkspace(dir)

  for await (const pkgDir of fsp.glob(['packages/*'], { withFileTypes: true })) {
    if (!pkgDir.isDirectory()) {
      continue
    }
    await addWorkspace(join(pkgDir.parentPath, pkgDir.name))
  }

  const find = (name: string) => {
    const pkg = packages.find(pkg => pkg.data.name === name)
    if (!pkg) {
      throw new Error(`Workspace package not found: ${name}`)
    }
    return pkg
  }

  const rename = (from: string, to: string) => {
    find(from).data._name = find(from).data.name
    find(from).data.name = to
    for (const pkg of packages) {
      pkg.updateDeps((dep) => {
        if (dep.name === from && !dep.range.startsWith('npm:')) {
          dep.range = `npm:${to}@${dep.range}`
        }
      })
    }
  }

  const setVersion = (name: string, newVersion: string, opts: { updateDeps?: boolean } = {}) => {
    find(name).data.version = newVersion
    if (!opts.updateDeps) {
      return
    }

    for (const pkg of packages) {
      pkg.updateDeps((dep) => {
        if (dep.name === name) {
          dep.range = newVersion
        }
      })
    }
  }

  const save = () => Promise.all(packages.map(pkg => pkg.save()))

  return {
    dir,
    workspacePkg,
    packages,
    save,
    find,
    rename,
    setVersion,
  }
}

export async function determineBumpType(config: ResolvedChangelogConfig) {
  const commits = await getLatestCommits(config)

  const bumpType = determineSemverChange(commits, config)

  return bumpType === 'major' ? 'minor' : bumpType
}

export async function getLatestCommits(config: ResolvedChangelogConfig) {
  const latestTag = execSync('git describe --tags --abbrev=0').toString().trim()

  return parseCommits(await getGitDiff(latestTag), config)
}

export async function getContributors() {
  const contributors = [] as Array<{ name: string, username: string }>
  const emails = new Set<string>()
  const latestTag = execSync('git describe --tags --abbrev=0').toString().trim()
  const rawCommits = await getGitDiff(latestTag)
  for (const commit of rawCommits) {
    if (emails.has(commit.author.email) || commit.author.name === 'renovate[bot]') {
      continue
    }
    const { author } = await fetch(`https://api.github.com/repos/${repo}/commits/${commit.shortHash}`, {
      headers: {
        'User-Agent': `${repo} github action automation`,
        'Accept': 'application/vnd.github.v3+json',
        'Authorization': `token ${process.env.GITHUB_TOKEN}`,
      },
    }).then(r => r.json() as Promise<{ author: { login: string, email: string } }>)
    if (!contributors.some(c => c.username === author.login)) {
      contributors.push({ name: commit.author.name, username: author.login })
    }
    emails.add(author.email)
  }
  return contributors
}
