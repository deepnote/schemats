/**
 * Generate typescript interface from table schema
 * Created by xiamx on 2016-08-10.
 */

import * as _ from 'lodash'

import { TableDefinition, Database } from './schemaInterfaces'
import Options from './options'

function nameIsReservedKeyword (name: string): boolean {
    const reservedKeywords = [
        'string',
        'number',
        'package'
    ]
    return reservedKeywords.indexOf(name) !== -1
}

function normalizeName (name: string, options: Options): string {
    if (nameIsReservedKeyword(name)) {
        return name + '_'
    } else {
        return name
    }
}

export function generateTableInterface (tableNameRaw: string, tableDefinition: TableDefinition, options: Options) {
    const tableName = options.transformTypeName(tableNameRaw)
    let members = ''
    Object.keys(tableDefinition).map(c => options.transformColumnName(c)).forEach((columnName) => {
        members += `${columnName}: ${tableName}Fields.${normalizeName(columnName, options)};\n`
    })

    return `
        export interface ${normalizeName(tableName, options)} {
        ${members}
        }
    `
}

export function generateEnumType (enumObject: any, options: Options) { // XXX generate real enum declaration?
    let enumString = ''
    for (let enumNameRaw in enumObject) {
        const enumName = options.transformTypeName(enumNameRaw)
        enumString += `export type ${enumName} = `
        enumString += enumObject[enumNameRaw].map((v: string) => `'${v}'`).join(' | ')
        enumString += ';\n'
    }
    return enumString
}

export function generateTableTypes (tableNameRaw: string, tableDefinition: TableDefinition, options: Options) {
    const tableName = options.transformTypeName(tableNameRaw)
    let fields = ''
    Object.keys(tableDefinition).forEach((columnNameRaw) => {
        let type = tableDefinition[columnNameRaw].tsType
        let nullable = tableDefinition[columnNameRaw].nullable ? '| null' : ''
        const columnName = options.transformColumnName(columnNameRaw)
        fields += `export type ${normalizeName(columnName, options)} = ${type}${nullable};\n`
    })

    return `
        export namespace ${tableName}Fields {
        ${fields}
        }
    `
}

export async function generateLookupEnum (db: Database, tableNameRaw: string, tableDefinition: TableDefinition, options: Options): Promise<string> {
    const tableName = options.transformTypeName(tableNameRaw)
    const primary = Object.keys(tableDefinition).find(col => tableDefinition[col].primary)
    if (!primary) {
        throw new TypeError('No primary column for lookup table')
    }
    
    let entries = ''
    
    const tableContent = await db.query(`SELECT * FROM ${tableNameRaw}`)
    
    tableContent.forEach(row => {
        let values = ''
        
        /* Object.keys(tableDefinition).forEach(columnNameRaw => { TODO this can be done prettier
            let type = tableDefinition[columnNameRaw].tsType
            const columnName = options.transformColumnName(columnNameRaw)
            
            values += `${JSON.stringify(row)}`
        }) */
        
        values = JSON.stringify(row)
        
        entries += `${(row as any)[primary]}: ${values} as ${tableName},\n`
    })
    
    return `
        export const ${tableName}Values = {
        ${entries}
        }
    `
}
