import fs from 'fs';
import path from 'path';

export const ensureDirectoryExists = (dirPath) => {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
};

export const generateFilename = (prefix = 'test') => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    return `${prefix}_${timestamp}`;
};

export const parseColumnDefinitions = (columnDefs) => {
    // Split by comma, but not inside square brackets
    const columns = [];
    let currentDef = '';
    let bracketCount = 0;
    
    for (let i = 0; i < columnDefs.length; i++) {
        const char = columnDefs[i];
        if (char === '[') bracketCount++;
        if (char === ']') bracketCount--;
        
        if (char === ',' && bracketCount === 0) {
            columns.push(currentDef.trim());
            currentDef = '';
        } else {
            currentDef += char;
        }
    }
    if (currentDef) columns.push(currentDef.trim());
    
    return columns.map(def => {
        const colonIndex = def.indexOf(':');
        const name = def.substring(0, colonIndex).trim();
        const type = def.substring(colonIndex + 1).trim();
        return { name, type };
    });
};

export const parseEnumValues = (type) => {
    // Remove 'enum[' from start and ']' from end
    const enumString = type.substring(5, type.length - 1);
    
    // Split by comma and clean up each value
    return enumString.split(',').map(value => {
        // Remove quotes and trim whitespace
        return value.replace(/['"]/g, '').trim();
    });
};
