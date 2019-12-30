#!/usr/bin/env node
const fs = require('fs')
const {prompt} = require('enquirer')
const semver = require('semver')
const chalk = require('chalk')

const getFilePath = async () => {
	const files = [
		'package.json',
		...fs.readdirSync(process.cwd())
	]

	const cli = await prompt({
		type: 'select',
		name: 'file',
		message: 'File config:',
		choices: files.filter((element, index, array) => array.indexOf(element) === index)
	})

	return cli.file
}

const getNewVersion = async currentVersion => {
	const versionTags = [
		'major',
		'minor',
		'patch',
		'custom'
		// 'prerelease'
	]

	const cli = await prompt({
		type: 'select',
		name: 'version',
		message: 'New Version:',
		choices: versionTags
	})
	const {version} = cli

	if (version === 'custom') {
		const newVersion = await prompt({
			type: 'input',
			name: 'version',
			message: 'Version Number:',
			initial: currentVersion
		})

		return newVersion.version
	}

	return semver.inc(currentVersion, version)
}

const showFragment = (text, findString, highlighted) => {
	const lines = text.split('\n')
	const findIndex = lines.findIndex(emement => emement.match(findString))
	const fragments = lines.slice(findIndex < 2 ? 0 : findIndex - 2, findIndex + 3) // Show 2 Line to top and 2 down
	const fragmentText = fragments.map(element => {
		const match = element.match(highlighted)
		if (match) {
			element = element.replace(highlighted, chalk.bold.white(highlighted))
		}

		return element
	}).join('\n')

	console.log(`${chalk.bold.bgBlack.greenBright('  Code:  ')}\n${chalk.dim(fragmentText)}`)
}

const main = async () => {
	const data = {}
	data.file = await getFilePath()
	if (!fs.existsSync(data.file)) {
		console.log(chalk.bold.red('⬢ File not found!'))
		process.exit(1)
	}

	const fileRaw = fs.readFileSync(data.file).toString()

	// Regex: https://regex101.com/r/Xhc3oV/2
	const currentVersionMatch = fileRaw.match(/["']version["'][\s:=]*["']([\w.-]*)["']/)
	if (!currentVersionMatch) {
		console.log(chalk.bold.red('⬢ Key \'version\' in file not found!'))
		process.exit(1)
	}

	console.log(`${chalk.bold.white('▶ Current version')}: ${chalk.cyan(currentVersionMatch[1])}`)

	data.version = await getNewVersion(currentVersionMatch[1])
	const newVersion = currentVersionMatch[0].replace(currentVersionMatch[1], data.version)
	const output = fileRaw.replace(currentVersionMatch[0], newVersion)

	showFragment(output, newVersion, data.version)
	const done = await prompt({
		type: 'confirm',
		name: 'ok',
		message: 'Is this OK?',
		initial: true
	})

	if (done.ok) {
		fs.writeFileSync(data.file, output)
	}
}

main().catch(error => {
	if (error !== '') {
		console.log('Error:', error)
	}
})
