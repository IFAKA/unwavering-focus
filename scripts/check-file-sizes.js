#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Configuration
const MAX_LINES = 300;
const EXEMPT_EXTENSIONS = ['.json', '.md', '.txt', '.yml', '.yaml', '.lock'];
const EXEMPT_FILES = ['package-lock.json', 'yarn.lock', 'pnpm-lock.yaml'];
const EXEMPT_DIRECTORIES = ['node_modules', 'dist', 'build', '.git', 'coverage'];

// Colors for console output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function isExemptFile(filePath) {
  const fileName = path.basename(filePath);
  const ext = path.extname(filePath);
  
  return EXEMPT_EXTENSIONS.includes(ext) || EXEMPT_FILES.includes(fileName);
}

function isExemptDirectory(dirPath) {
  const dirName = path.basename(dirPath);
  return EXEMPT_DIRECTORIES.includes(dirName);
}

function countLines(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return content.split('\n').length;
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error.message);
    return 0;
  }
}

function scanDirectory(dirPath, results = []) {
  try {
    const items = fs.readdirSync(dirPath);
    
    for (const item of items) {
      const fullPath = path.join(dirPath, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        if (!isExemptDirectory(item)) {
          scanDirectory(fullPath, results);
        }
      } else if (stat.isFile()) {
        // Check if it's a source code file
        const ext = path.extname(item);
        const isSourceFile = ['.ts', '.tsx', '.js', '.jsx'].includes(ext);
        
        if (isSourceFile && !isExemptFile(fullPath)) {
          const lineCount = countLines(fullPath);
          if (lineCount > MAX_LINES) {
            results.push({
              file: fullPath,
              lines: lineCount,
              relativePath: path.relative(process.cwd(), fullPath)
            });
          }
        }
      }
    }
  } catch (error) {
    console.error(`Error scanning directory ${dirPath}:`, error.message);
  }
  
  return results;
}

function generateRefactoringSuggestions(filePath, lineCount) {
  const suggestions = [];
  
  if (lineCount > 500) {
    suggestions.push('CRITICAL: This file is extremely large and needs immediate refactoring');
    suggestions.push('Consider breaking it into 3-5 smaller files');
  } else if (lineCount > 400) {
    suggestions.push('HIGH PRIORITY: This file needs significant refactoring');
    suggestions.push('Consider breaking it into 2-3 smaller files');
  } else if (lineCount > 300) {
    suggestions.push('MEDIUM PRIORITY: This file exceeds the 300-line limit');
    suggestions.push('Consider extracting related functions into separate files');
  }
  
  return suggestions;
}

function main() {
  log('🔍 Scanning for files exceeding 300 lines...', 'cyan');
  log('', 'reset');
  
  const srcPath = path.join(process.cwd(), 'src');
  
  if (!fs.existsSync(srcPath)) {
    log('❌ src directory not found!', 'red');
    process.exit(1);
  }
  
  const largeFiles = scanDirectory(srcPath);
  
  if (largeFiles.length === 0) {
    log('✅ All files are under 300 lines!', 'green');
    log('🎉 Your codebase follows the size guidelines.', 'green');
    return;
  }
  
  // Sort by line count (largest first)
  largeFiles.sort((a, b) => b.lines - a.lines);
  
  log(`❌ Found ${largeFiles.length} file(s) exceeding ${MAX_LINES} lines:`, 'red');
  log('', 'reset');
  
  let totalExcessLines = 0;
  
  largeFiles.forEach((file, index) => {
    const excessLines = file.lines - MAX_LINES;
    totalExcessLines += excessLines;
    
    log(`${index + 1}. ${file.relativePath}`, 'yellow');
    log(`   Lines: ${file.lines} (${excessLines} over limit)`, 'red');
    
    const suggestions = generateRefactoringSuggestions(file.file, file.lines);
    suggestions.forEach(suggestion => {
      log(`   💡 ${suggestion}`, 'blue');
    });
    
    log('', 'reset');
  });
  
  log(`📊 Summary:`, 'magenta');
  log(`   Total files over limit: ${largeFiles.length}`, 'magenta');
  log(`   Total excess lines: ${totalExcessLines}`, 'magenta');
  log(`   Average excess per file: ${Math.round(totalExcessLines / largeFiles.length)}`, 'magenta');
  log('', 'reset');
  
  log('🚨 REFACTORING REQUIRED:', 'red');
  log('   Files exceeding 300 lines must be refactored before adding new features.', 'red');
  log('   Consider the following refactoring strategies:', 'yellow');
  log('', 'reset');
  
  log('   📋 Refactoring Strategies:', 'cyan');
  log('   1. Extract related functions into separate utility files', 'cyan');
  log('   2. Break large components into smaller, focused components', 'cyan');
  log('   3. Move business logic into service files', 'cyan');
  log('   4. Create separate files for constants and types', 'cyan');
  log('   5. Use barrel exports (index.ts) for clean imports', 'cyan');
  log('', 'reset');
  
  log('   🛠️  Example refactoring pattern:', 'cyan');
  log('   Before: large-file.ts (400 lines)', 'cyan');
  log('   After:', 'cyan');
  log('     ├── large-file.ts (150 lines - main logic)', 'cyan');
  log('     ├── large-file.utils.ts (100 lines - utilities)', 'cyan');
  log('     ├── large-file.types.ts (50 lines - types)', 'cyan');
  log('     └── large-file.constants.ts (50 lines - constants)', 'cyan');
  log('', 'reset');
  
  process.exit(1);
}

if (require.main === module) {
  main();
}

module.exports = {
  scanDirectory,
  countLines,
  generateRefactoringSuggestions
};
