/**
 * server/utils/ajv.ts
 * JSON Schema validation helper using AJV:
 * - Extends AJV with a custom keyword 'ValidateByFunction' for complex type and range checks
 * - Formats validation error paths and messages into concise strings
 */

import { JSONSchemaType } from 'ajv'
import Ajv from 'ajv'
const ajv = new Ajv()

// Custom keyword enabling runtime function-based validation
ajv.addKeyword({
	keyword: 'ValidateByFunction',
	validate: (schema: object, data: any) => {
		if (typeof schema !== 'function') return false
		if (!schema(data)) return false
		return true
	},
	error: {
		message: 'ValidateByFunction error'
	}
})

/**
 * Validates data against the provided AJV JSON Schema.
 * Returns { error: false } if valid, or { error: true, message: string } if invalid.
 */
function ajvValidate(schema: object, data: any): { error: true; message: string } | { error: false } {
	if (!schema) return { error: true, message: 'No schema provided' }
	let validate = ajv.compile(schema)
	let valid = validate(data)

	if (validate.errors) {
		let path = validate.errors[0].instancePath
		path = path ? `'${path.replace('/', '')}' ` : ''
		return { error: true, message: path + validate.errors[0].message }
	} else if (valid === true) return { error: false }
	else return { error: true, message: 'Some undefined errors have occurred' }
}

export { ajvValidate }
export type AJVSchema<T> = JSONSchemaType<T>
