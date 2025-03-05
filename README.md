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
- Date: Generate random dates
- start_date: Generate start dates (works in pairs with end_date)
- end_date: Generate end dates that are always >= corresponding start_date
- Number: Generate random numbers
- Boolean: Generate true/false values

### Date Column Pairs

When using start_date and end_date, name your columns with matching prefixes. For example:
```bash
node generate-xlsx.js 100 "projectStartDate:start_date,projectEndDate:end_date"
```
This ensures that projectEndDate will always be greater than or equal to projectStartDate.

### Example:

```bash
node generate-xlsx.js 100 "id:UUID,firstName:Name,lastName:LastName,email:Email,phone:Phone,startDate:start_date,endDate:end_date"
```

This will generate an Excel file in the `results/excel` directory with the format `test_TIMESTAMP.xlsx` containing 100 rows of random data with the specified columns.

### Output Location

All generated files are saved in the `results/excel` directory with automatically generated filenames in the format:
```
test_YYYY-MM-DDTHH-mm-ss-mmmZ.xlsx
```
