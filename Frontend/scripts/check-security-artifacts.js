import fs from 'node:fs'
import path from 'node:path'

const distDirectory = path.resolve(import.meta.dirname, '../dist')
if (!fs.existsSync(distDirectory)) throw new Error('Build output does not exist; run the production build first')

const files = []
const visit = directory => {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const entryPath = path.join(directory, entry.name)
    if (entry.isDirectory()) visit(entryPath)
    else files.push(entryPath)
  }
}
visit(distDirectory)

const sourceMaps = files.filter(file => file.endsWith('.map'))
const sourceMapReferences = files.filter(file => /\.(?:js|css)$/.test(file) && /sourceMappingURL=/i.test(fs.readFileSync(file, 'utf8')))
if (sourceMaps.length || sourceMapReferences.length) {
  throw new Error(`Production artifacts expose source maps: ${[...sourceMaps, ...sourceMapReferences].join(', ')}`)
}

console.log(`Security artifact check passed (${files.length} files, no source maps)`)
