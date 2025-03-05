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
- Email: Generate email addresses (uses Name/LastName if available)
- Phone: Generate formatted phone numbers
- Address: Generate realistic street addresses
- Date: Generate random dates
- start_date: Generate start dates (works in pairs with end_date)
- end_date: Generate end dates that are always >= corresponding start_date
- Number: Generate random numbers
- Boolean: Generate true/false values

### Smart Email Generation

When generating email addresses, the tool follows these rules:
1. If both Name and LastName exist:
   - Creates an email using `firstname.lastname1234@example.com`
2. If only Name exists:
   - Creates an email using `firstname1234@example.com`
3. If only LastName exists:
   - Creates an email using `lastname1234@example.com`
4. If neither Name nor LastName exists:
   - Generates a random username with random number: `username1234@example.com`

In all cases:
- Random numbers are always > 1000
- All emails use the `example.com` domain
- All usernames are converted to lowercase

Example with smart email generation:
```bash
node generate-xlsx.js 100 "id:UUID,firstName:Name,lastName:LastName,email:Email"
# Might generate: john.smith1234@example.com
```

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
