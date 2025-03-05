#!/usr/bin/env node

import ExcelJS from 'exceljs';
import { v4 as uuidv4 } from 'uuid';
import { faker } from '@faker-js/faker';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import path from 'path';
import fs from 'fs';

// Store generated values for related columns
const generatedValues = new Map();

const generateRandomNumber = (min = 1000, max = 9999) => {
    return faker.number.int({ min, max });
};

const generateEmail = (rowIndex, options = {}) => {
    const rowValues = generatedValues.get(rowIndex) || new Map();
    const firstName = rowValues.get('firstName');
    const lastName = rowValues.get('lastName');
    const domain = 'example.com';
    const randomNum = generateRandomNumber();
    
    if (firstName && lastName) {
        // If both names exist, combine them
        return `${firstName.toLowerCase()}.${lastName.toLowerCase()}${randomNum}@${domain}`;
    } else if (firstName) {
        // Only first name exists
        return `${firstName.toLowerCase()}${randomNum}@${domain}`;
    } else if (lastName) {
        // Only last name exists
        return `${lastName.toLowerCase()}${randomNum}@${domain}`;
    }
    
    // Neither name exists, generate random email with example.com domain
    const username = faker.internet.userName();
    return `${username}${randomNum}@${domain}`;
};

const generateData = (type, rowIndex, columnName, options = {}) => {
    // Ensure row storage exists
    if (!generatedValues.has(rowIndex)) {
        generatedValues.set(rowIndex, new Map());
    }
    const rowValues = generatedValues.get(rowIndex);

    switch (type.toLowerCase()) {
        case 'uuid':
            return uuidv4();
        case 'name': {
            const value = faker.person.firstName();
            rowValues.set('firstName', value);
            return value;
        }
        case 'lastname': {
            const value = faker.person.lastName();
            rowValues.set('lastName', value);
            return value;
        }
        case 'email':
            return generateEmail(rowIndex, options);
        case 'phone':
            return faker.phone.number('###-###-####');
        case 'address':
            return faker.location.streetAddress();
        case 'date': {
            const start = options.startDate || new Date(2020, 0, 1);
            const end = options.endDate || new Date();
            const date = faker.date.between({ from: start, to: end });
            return date;
        }
        case 'start_date': {
            const start = options.startDate || new Date(2020, 0, 1);
            const end = options.endDate || new Date();
            const date = faker.date.between({ from: start, to: end });
            rowValues.set(columnName, date);
            return date;
        }
        case 'end_date': {
            // Find the corresponding start_date column
            const startDateColumn = options.columns.find(col => 
                col.type.toLowerCase() === 'start_date' &&
                col.name.toLowerCase().replace('start', 'end') === columnName.toLowerCase()
            );

            let minDate;
            if (startDateColumn && rowValues.has(startDateColumn.name)) {
                // Use the corresponding start_date as minimum
                minDate = rowValues.get(startDateColumn.name);
            } else {
                // If no start_date found, use default range
                minDate = options.startDate || new Date(2020, 0, 1);
            }
            
            const maxDate = options.endDate || new Date();
            // Generate date between start_date and maxDate
            const date = faker.date.between({ from: minDate, to: maxDate });
            return date;
        }
        case 'number':
            const min = options.min || 0;
            const max = options.max || 1000;
            return faker.number.int({ min, max });
        case 'boolean':
            return faker.datatype.boolean();
        default:
            return '';
    }
};

const parseColumnDefinitions = (columnDefs) => {
    return columnDefs.split(',').map(def => {
        const [name, type] = def.split(':');
        return { name, type };
    });
};

const ensureDirectoryExists = (dirPath) => {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
};

const generateFilename = () => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    return `test_${timestamp}.xlsx`;
};

async function generateExcel(rowCount, columnDefinitions) {
    // Clear the generated values for a new file
    generatedValues.clear();

    // Ensure the results/excel directory exists
    const resultsDir = path.join(process.cwd(), 'results', 'excel');
    ensureDirectoryExists(resultsDir);

    const filename = generateFilename();
    const fullPath = path.join(resultsDir, filename);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Generated Data');

    const columns = parseColumnDefinitions(columnDefinitions);
    
    // Set up headers
    worksheet.columns = columns.map(col => ({
        header: col.name,
        key: col.name,
        width: 15
    }));

    // Generate data rows
    for (let i = 0; i < rowCount; i++) {
        const row = {};
        columns.forEach(col => {
            row[col.name] = generateData(col.type, i, col.name, { columns });
        });
        worksheet.addRow(row);
    }

    // Apply some styling
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };

    // Format date columns
    columns.forEach(col => {
        if (['date', 'start_date', 'end_date'].includes(col.type.toLowerCase())) {
            worksheet.getColumn(col.name).numFmt = 'yyyy-mm-dd';
        }
    });

    // Auto-fit columns
    worksheet.columns.forEach(column => {
        column.width = Math.max(
            column.header.length + 2,
            15
        );
    });

    // Save the workbook
    await workbook.xlsx.writeFile(fullPath);
    console.log(`Successfully generated ${filename} with ${rowCount} rows of data.`);
    console.log(`File location: ${fullPath}`);
}

// Parse command line arguments
const argv = yargs(hideBin(process.argv))
    .command('$0 <rowCount> <columnDefs>', 'Generate an Excel file with random data', (yargs) => {
        yargs
            .positional('rowCount', {
                describe: 'Number of rows to generate',
                type: 'number'
            })
            .positional('columnDefs', {
                describe: 'Column definitions (name:type,name:type,...)',
                type: 'string'
            });
    })
    .help()
    .argv;

generateExcel(argv.rowCount, argv.columnDefs)
    .catch(error => {
        console.error('Error generating Excel file:', error);
        process.exit(1);
    });
