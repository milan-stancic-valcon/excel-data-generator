import { v4 as uuidv4 } from 'uuid';
import { faker } from '@faker-js/faker';
import { parseEnumValues } from './utils.js';

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

export const generateData = (type, rowIndex, columnName, options = {}) => {
    let min = 0;;
    let max = 9999999;
    // Ensure row storage exists
    if (!generatedValues.has(rowIndex)) {
        generatedValues.set(rowIndex, new Map());
    }
    const rowValues = generatedValues.get(rowIndex);

    // Check if it's an enum type with values
    if (type && type.startsWith('enum[') && type.endsWith(']')) {
        try {
            const enumValues = parseEnumValues(type);
            return faker.helpers.arrayElement(enumValues);
        } catch (error) {
            console.error(`Error parsing enum values for column ${columnName}:`, error);
            return '';
        }
    }

    switch (type && type.toLowerCase()) {
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
            min = options.min || 0;
            max = options.max || 1000;
            return faker.number.int({ min, max });
        case 'int32':
            min = options.min || -2147483648;
            max = options.max || 2147483647;
                return faker.number.int({ min, max });
        case 'int64':
            min = options.min || -9223372036854775808;
            max = options.max || 9223372036854775807;
                return faker.number.int({ min, max });
        case 'boolean':
            return faker.datatype.boolean();
        default:
            return '';
    }
};

export const clearGeneratedValues = () => {
    generatedValues.clear();
};
