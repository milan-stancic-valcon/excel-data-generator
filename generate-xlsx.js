#!/usr/bin/env node

import ExcelJS from 'exceljs';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import path from 'path';
import { generateData, clearGeneratedValues } from './src/dataGenerator.js';
import { ensureDirectoryExists, generateFilename, parseColumnDefinitions } from './src/utils.js';

async function generateExcel(rowCount, columnDefinitions) {
    // Clear the generated values for a new file
    clearGeneratedValues();

    // Ensure the results/excel directory exists
    const resultsDir = path.join(process.cwd(), 'results', 'excel');
    ensureDirectoryExists(resultsDir);

    const filename = `${generateFilename()}.xlsx`;
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
            worksheet.getColumn(col.name).numFmt = 'dd-mm-yyyy';
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
