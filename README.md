# Excel Data Generator

A command-line tool to generate Excel (XLSX) files with random test data.

## Installation

1. Clone this repository
2. Install dependencies:
```bash
npm install
```

## Usage

```bash
node generate-xlsx.js <rowCount> <columnDefinitions>
```

### Parameters:

- `rowCount`: Number of rows to generate
- `columnDefinitions`: Comma-separated list of column definitions in format 'name:type'

### Supported Data Types:

- UUID: Generate valid UUIDs
- Name: Generate realistic first names
- LastName: Generate realistic last names
- Email: Generate realistic email addresses
- Phone: Generate formatted phone numbers
- Address: Generate realistic street addresses
- Date: Generate dates in standard format
- Number: Generate random numbers
- Boolean: Generate true/false values

### Example:

```bash
node generate-xlsx.js 100 id:UUID,firstName:Name,lastName:LastName,email:Email,phone:Phone,isActive:Boolean
```

This will generate an Excel file in the `results/excel` directory with the format `test_TIMESTAMP.xlsx` containing 100 rows of random data with the specified columns.

### Output Location

All generated files are saved in the `results/excel` directory with automatically generated filenames in the format:
```
test_YYYY-MM-DDTHH-mm-ss-mmmZ.xlsx
```
