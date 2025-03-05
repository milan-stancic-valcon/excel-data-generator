#!/usr/bin/env node

import ExcelJS from 'exceljs';
import { v4 as uuidv4 } from 'uuid';
import { faker } from '@faker-js/faker';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import path from 'path';
import fs from 'fs';

// Store generated dates for related columns
const generatedDates = new Map();

const generateData = (type, rowIndex, columnName, options = {}) => {
    switch (type.toLowerCase()) {
        case 'uuid':
            return uuidv4();
        case 'name':
            return faker.person.firstName();
        case 'lastname':
            return faker.person.lastName();
        case 'email':
            return faker.internet.email();
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
            // Store the generated date for this row
            if (!generatedDates.has(rowIndex)) {
                generatedDates.set(rowIndex, new Map());
            }
            generatedDates.get(rowIndex).set(columnName, date);
            return date;
        }
        case 'end_date': {
            // Find the corresponding start_date column
            const startDateColumn = options.columns.find(col => 
                col.type.toLowerCase() === 'start_date' &&
                col.name.toLowerCase().replace('start', 'end') === columnName.toLowerCase()
            );

            let minDate;
            if (startDateColumn && generatedDates.has(rowIndex) && 
                generatedDates.get(rowIndex).has(startDateColumn.name)) {
                // Use the corresponding start_date as minimum
                minDate = generatedDates.get(rowIndex).get(startDateColumn.name);
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
    // Clear the generated dates for a new file
    generatedDates.clear();

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
