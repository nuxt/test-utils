import { promises as fsp } from 'node:fs'
import { resolve } from 'pathe'
import { exec } from 'tinyexec'
import { determineSemverChange, getGitDiff, loadChangelogConfig, parseCommits } from 'changelogen'

interface Dep {
  name: string
  range: string
  type: string
}

async function loadPackage(dir: string) {
  const pkgPath = resolve(dir, 'package.json')
  const data = JSON.parse(await fsp.readFile(pkgPath, 'utf-8').catch(() => '{}'))
  const save = () => fsp.writeFile(pkgPath, JSON.stringify(data, null, 2) + '\n')

  const updateDeps = (reviver: (dep: Dep) => Dep | void) => {
    for (const type of ['dependencies', 'devDependencies', 'optionalDependencies', 'peerDependencies']) {
      if (!data[type]) {
        continue
      }
      for (const e of Object.entries(data[type])) {
        const dep: Dep = { name: e[0], range: e[1] as string, type }
        // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
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

  const packages = [await loadPackage(process.cwd())]

  const find = (name: string) => {
    const pkg = packages.find(pkg => pkg.data.name === name)
    if (!pkg) {
      throw new Error('Workspace package not found: ' + name)
    }
    return pkg
  }

  const rename = (from: string, to: string) => {
    find(from).data._name = find(from).data.name
    find(from).data.name = to
    for (const pkg of packages) {
      pkg.updateDeps((dep) => {
        if (dep.name === from && !dep.range.startsWith('npm:')) {
          dep.range = 'npm:' + to + '@' + dep.range
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

export async function determineBumpType() {
  const config = await loadChangelogConfig(process.cwd())
  const commits = await getLatestCommits()

  const bumpType = determineSemverChange(commits, config)

  return bumpType === 'major' ? 'minor' : bumpType
}

export async function getLatestCommits() {
  const config = await loadChangelogConfig(process.cwd())
  const { stdout: latestTag } = await exec('git', ['describe', '--tags', '--abbrev=0'])

  return parseCommits(await getGitDiff(latestTag.trim()), config)
}
