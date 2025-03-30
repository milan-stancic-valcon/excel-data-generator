#!/usr/bin/env node

import fs from 'fs';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import path from 'path';
import { generateData, clearGeneratedValues } from './src/dataGenerator.js';
import { ensureDirectoryExists, generateFilename, parseColumnDefinitions } from './src/utils.js';

async function generateCSV(rowCount, columnDefinitions) {
    // Clear the generated values for a new file
    clearGeneratedValues();

    // Ensure the results/csv directory exists
    const resultsDir = path.join(process.cwd(), 'results', 'csv');
    ensureDirectoryExists(resultsDir);

    const filename = `${generateFilename()}.csv`;
    const fullPath = path.join(resultsDir, filename);

    const columns = parseColumnDefinitions(columnDefinitions);
    
    // Generate CSV content
    const csvRows = [];

    // Add header row
    csvRows.push(columns.map(col => col.name).join(','));

    // Generate data rows
    for (let i = 0; i < rowCount; i++) {
        const rowData = columns.map(col => {
            const value = generateData(col.type, i, col.name, { columns });
            
            if (value instanceof Date) {
                //return value.toISOString().split('T')[0]; // yyyy-mm-dd format

                // Extract day, month, and year
                const day = String(value.getDate()).padStart(2, '0');
                const month = String(value.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
                const year = value.getFullYear();
                
                // Return in dd-mm-yyyy format
                return `${day}-${month}-${year}`;
            }
            
            // Escape and quote strings if they contain special characters
            if (typeof value === 'string') {
                if (value.includes(',') || value.includes('"') || value.includes('\n')) {
                    return `"${value.replace(/"/g, '""')}"`;
                }
                return value;
            }
            
            return String(value);
        });
        csvRows.push(rowData.join(','));
    }

    // Write to file
    fs.writeFileSync(fullPath, csvRows.join('\n'));
    console.log(`Successfully generated ${filename} with ${rowCount} rows of data.`);
    console.log(`File location: ${fullPath}`);
}

// Parse command line arguments
const argv = yargs(hideBin(process.argv))
    .command('$0 <rowCount> <columnDefs>', 'Generate a CSV file with random data', (yargs) => {
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

generateCSV(argv.rowCount, argv.columnDefs)
    .catch(error => {
        console.error('Error generating CSV file:', error);
        process.exit(1);
    });
