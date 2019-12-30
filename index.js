#!/usr/bin/env node
const fs = require('fs')
const path = require('path')
const {prompt} = require('enquirer')
const semver = require('semver')

const typesOptions = [
	{name: 'NPM Package', value: 'npm'},
	{name: 'Quasar + Cordova', value: 'quasar'},
	{name: 'Cordova', value: 'cordova'}
]

const versionTags = [
	'major',
	'minor',
	'patch'
	// 'prerelease'
]

const suggestAutoComplete = (input, choices) => choices.filter(choice => choice.message.startsWith(input))

const getConfig = async () => {
	const files = [
		'package.json',
		'quasar.conf.js',
		'config.xml',
		'plugin.xml',
		...fs.readdirSync(process.cwd())
	]

	const cli = await prompt([{
		type: 'autocomplete',
		name: 'type',
		message: 'Type:',
		suggest: suggestAutoComplete,
		choices: typesOptions
	}, {
		type: 'select',
		name: 'version',
		message: 'version:',
		choices: versionTags
	}, {
		type: 'select',
		name: 'file',
		message: 'File config:',
		choices: files.filter((element, index, array) => array.indexOf(element) === index)
	}])

	return cli
}

const main = async () => {
	const data = getConfig()
	const output = ''
	// Fs.writeFileSync(data.file, output)
}

main().catch(error => {
	if (error !== '') {
		console.log('Error:', error)
	}
})
