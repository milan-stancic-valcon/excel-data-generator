# Excel and CSV Data Generator

A command-line tool to generate Excel (XLSX) and CSV files with random test data.

## Installation

### Local Installation
1. Clone this repository
2. Install dependencies:
```bash
npm install
```

### Docker Installation
1. Build the Docker image:
```bash
docker build -t data-generator .
```

## Usage

### Local Usage
```bash
# Generate Excel file
node generate-xlsx.js <rowCount> <columnDefinitions>

# Generate CSV file
node generate-csv.js <rowCount> <columnDefinitions>
```

### Docker Usage
```bash
# Basic usage (prints help)
docker run data-generator

# Generate Excel file
docker run -v "$(pwd)/results:/usr/src/app/results" data-generator generate-xlsx.js 100 "id:UUID,name:Name"

# Generate CSV file
docker run -v "$(pwd)/results:/usr/src/app/results" data-generator generate-csv.js 100 "id:UUID,name:Name"

# Windows PowerShell
docker run -v "${PWD}/results:/usr/src/app/results" data-generator generate-xlsx.js 100 "id:UUID,name:Name"
```

Note: The `-v` flag maps your local `results` directory to the container's output directory, allowing you to access the generated files.

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
- enum[values]: Generate random values from a specified list

### Enum Type Usage

You can specify enum values as a comma-separated list in the column definition:
```bash
# Local usage - Excel
node generate-xlsx.js 100 "id:UUID,status:enum[To Do,In Progress,Blocked,Done]"

# Local usage - CSV
node generate-csv.js 100 "id:UUID,status:enum[To Do,In Progress,Blocked,Done]"

# Docker usage - Excel
docker run -v "$(pwd)/results:/usr/src/app/results" data-generator generate-xlsx.js 100 "id:UUID,status:enum[To Do,In Progress,Blocked,Done]"

# Docker usage - CSV
docker run -v "$(pwd)/results:/usr/src/app/results" data-generator generate-csv.js 100 "id:UUID,status:enum[To Do,In Progress,Blocked,Done]"
```

The generator will randomly select values from the provided list for each row.

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
# Local usage - Excel
node generate-xlsx.js 100 "id:UUID,firstName:Name,lastName:LastName,email:Email"

# Local usage - CSV
node generate-csv.js 100 "id:UUID,firstName:Name,lastName:LastName,email:Email"

# Docker usage - Excel
docker run -v "$(pwd)/results:/usr/src/app/results" data-generator generate-xlsx.js 100 "id:UUID,firstName:Name,lastName:LastName,email:Email"

# Docker usage - CSV
docker run -v "$(pwd)/results:/usr/src/app/results" data-generator generate-csv.js 100 "id:UUID,firstName:Name,lastName:LastName,email:Email"
```

### Date Column Pairs

When using start_date and end_date, name your columns with matching prefixes. For example:
```bash
# Local usage - Excel
node generate-xlsx.js 100 "projectStartDate:start_date,projectEndDate:end_date"

# Local usage - CSV
node generate-csv.js 100 "projectStartDate:start_date,projectEndDate:end_date"

# Docker usage - Excel
docker run -v "$(pwd)/results:/usr/src/app/results" data-generator generate-xlsx.js 100 "projectStartDate:start_date,projectEndDate:end_date"

# Docker usage - CSV
docker run -v "$(pwd)/results:/usr/src/app/results" data-generator generate-csv.js 100 "projectStartDate:start_date,projectEndDate:end_date"
```
This ensures that projectEndDate will always be greater than or equal to projectStartDate.

### Complete Example:

```bash
# Local usage - Excel
node generate-xlsx.js 100 "id:UUID,firstName:Name,lastName:LastName,email:Email,phone:Phone,startDate:start_date,endDate:end_date,status:enum[To Do,In Progress,Blocked,Done]"

# Local usage - CSV
node generate-csv.js 100 "id:UUID,firstName:Name,lastName:LastName,email:Email,phone:Phone,startDate:start_date,endDate:end_date,status:enum[To Do,In Progress,Blocked,Done]"

# Docker usage - Excel
docker run -v "$(pwd)/results:/usr/src/app/results" data-generator generate-xlsx.js 100 "id:UUID,firstName:Name,lastName:LastName,email:Email,phone:Phone,startDate:start_date,endDate:end_date,status:enum[To Do,In Progress,Blocked,Done]"

# Docker usage - CSV
docker run -v "$(pwd)/results:/usr/src/app/results" data-generator generate-csv.js 100 "id:UUID,firstName:Name,lastName:LastName,email:Email,phone:Phone,startDate:start_date,endDate:end_date,status:enum[To Do,In Progress,Blocked,Done]"
```

### Output Location

Generated files are saved in the following directories with automatically generated filenames:
- Excel files: `results/excel/test_YYYY-MM-DDTHH-mm-ss-mmmZ.xlsx`
- CSV files: `results/csv/test_YYYY-MM-DDTHH-mm-ss-mmmZ.csv`

### Format Differences

#### Excel Format (.xlsx)
- Column headers are bold and centered
- Dates are formatted as proper Excel dates (allows sorting and filtering)
- Columns are auto-sized to fit content
- Data types are preserved (numbers, dates, text)

#### CSV Format (.csv)
- Simple text format with comma-separated values
- Dates are formatted as YYYY-MM-DD
- Strings containing commas, quotes, or newlines are properly escaped
- All values are stored as text
