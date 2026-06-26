import fs from "fs"
import path, { dirname } from "path"
import { fileURLToPath } from 'url';
import JavaScriptObfuscator from "javascript-obfuscator"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const sourceDirectory     = 'dist/src';
const obfuscatedDirectory = 'build';

const obfuscateCode = (filepath) => {
    const code = fs.readFileSync(filepath, 'utf8')

    const obfuscatedCode = JavaScriptObfuscator.obfuscate(code, {
        compact: true,
        controlFlowFlattening : true
    })

    const obfuscatedFilePath = path.join(
        obfuscatedDirectory,
        path.relative(sourceDirectory, filepath)
    )

    fs.mkdirSync(path.dirname(obfuscatedFilePath), { recursive : true })
    fs.writeFileSync(obfuscatedFilePath, obfuscatedCode.getObfuscatedCode(), 'utf-8')
}

const processDirectory = (directoryPath) => {
    const files = fs.readdirSync(directoryPath)

    files.forEach(
        (file) => {
            const filePath = path.join(directoryPath, file)
            if (fs.statSync(filePath).isDirectory()){
                processDirectory(filePath)
            } else if (path.extname(file) === ".js"){
                obfuscateCode(file)
            }
        }
    )
}