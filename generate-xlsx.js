#!/usr/bin/env node

import ExcelJS from 'exceljs';
import { v4 as uuidv4 } from 'uuid';
import { faker } from '@faker-js/faker';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import path from 'path';
import fs from 'fs';

const generateData = (type, options = {}) => {
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
        case 'date':
            const start = options.startDate || new Date(2020, 0, 1);
            const end = options.endDate || new Date();
            return faker.date.between({ from: start, to: end });
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
            row[col.name] = generateData(col.type);
        });
        worksheet.addRow(row);
    }

    // Apply some styling
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };

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
