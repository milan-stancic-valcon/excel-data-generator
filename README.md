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
node generate-xlsx.js <filename> <rowCount> <columnDefinitions>
```

### Parameters:

- `filename`: Output Excel file name (e.g., output.xlsx)
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
node generate-xlsx.js output.xlsx 100 id:UUID,firstName:Name,lastName:LastName,email:Email,phone:Phone,isActive:Boolean
```

This will generate an Excel file named 'output.xlsx' with 100 rows of random data containing the specified columns.
