/**
 * FTP Deployment Script for Smart EMI Calculator
 * 
 * Usage:
 *   npm run deploy          - Deploy to production
 *   npm run deploy:dry-run  - Test without uploading
 *   npm run deploy:verbose  - Deploy with verbose logging
 * 
 * Configuration: Set values in .env file
 */

const { Client } = require('basic-ftp');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// ============================================================================
// LOGGING UTILITIES
// ============================================================================
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m'
};

const log = {
    info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
    success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
    error: (msg) => console.error(`${colors.red}❌ ${msg}${colors.reset}`),
    warn: (msg) => console.warn(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
    header: (msg) => console.log(`\n${colors.cyan}${colors.bright}${'='.repeat(60)}\n${msg}\n${'='.repeat(60)}${colors.reset}\n`)
};

// ============================================================================
// CONFIGURATION
// ============================================================================
const config = {
    host: process.env.FTP_HOST || 'ftp.rinmukt.com',
    user: process.env.FTP_USER || 'u836338583.achaudhary7',
    password: process.env.FTP_PASSWORD || '',
    secure: false,
    remoteDir: process.env.FTP_REMOTE_DIR || '/public_html',
    filesToDeploy: [
        'index.html',
        '.htaccess',
        'fonts/outfit-400.woff2',
        'fonts/outfit-600.woff2',
        'fonts/outfit-700.woff2',
        'fonts/jetbrains-mono-500.woff2'
    ]
};

// ============================================================================
// COMMAND LINE ARGUMENTS
// ============================================================================
const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
const isVerbose = args.includes('--verbose');

// ============================================================================
// VALIDATION
// ============================================================================
function validateConfig() {
    log.header('🔍 VALIDATING CONFIGURATION');
    
    // Check password
    if (!config.password) {
        log.error('FTP_PASSWORD is not set!');
        log.info('Create a .env file with: FTP_PASSWORD=your_password');
        return false;
    }
    log.success(`Password configured (${config.password.length} characters)`);

    // Check if files exist
    let allFilesExist = true;
    for (const file of config.filesToDeploy) {
        if (fs.existsSync(file)) {
            const stats = fs.statSync(file);
            const sizeKB = (stats.size / 1024).toFixed(2);
            log.success(`Found: ${file} (${sizeKB} KB)`);
        } else {
            log.error(`Missing: ${file}`);
            allFilesExist = false;
        }
    }

    if (!allFilesExist) {
        log.error('Some files are missing. Please check your filesToDeploy list.');
        return false;
    }

    log.success('All validations passed!');
    return true;
}

// ============================================================================
// GET FILE INFO
// ============================================================================
function getFileInfo(filePath) {
    const stats = fs.statSync(filePath);
    return {
        name: path.basename(filePath),
        size: stats.size,
        sizeFormatted: (stats.size / 1024).toFixed(2) + ' KB',
        modified: stats.mtime
    };
}

// ============================================================================
// DEPLOYMENT FUNCTION
// ============================================================================
async function deploy() {
    log.header('🚀 STARTING DEPLOYMENT');
    
    console.log(`📡 Host: ${config.host}`);
    console.log(`👤 User: ${config.user}`);
    console.log(`📁 Remote: ${config.remoteDir}`);
    console.log(`📄 Files: ${config.filesToDeploy.length} file(s)`);
    console.log(`🔧 Mode: ${isDryRun ? 'DRY RUN (no upload)' : 'LIVE DEPLOYMENT'}\n`);

    if (isDryRun) {
        log.warn('DRY RUN MODE - No files will be uploaded');
        log.info('Files that would be deployed:');
        for (const file of config.filesToDeploy) {
            const info = getFileInfo(file);
            console.log(`   📄 ${info.name} (${info.sizeFormatted})`);
        }
        log.success('Dry run completed successfully!');
        return true;
    }

    const client = new Client();
    if (isVerbose) {
        client.ftp.verbose = true;
    }

    try {
        // Connect to FTP server
        log.info('Connecting to FTP server...');
        await client.access({
            host: config.host,
            user: config.user,
            password: config.password,
            secure: config.secure
        });
        log.success('Connected to FTP server!');

        // List remote directory to verify connection
        log.info(`Navigating to ${config.remoteDir}...`);
        await client.cd(config.remoteDir);
        log.success(`Changed to ${config.remoteDir}`);

        // Upload files
        log.header('📤 UPLOADING FILES');
        
        let uploadedCount = 0;
        let totalSize = 0;
        const createdDirs = new Set();

        for (const file of config.filesToDeploy) {
            const localPath = path.resolve(file);
            const remotePath = file.replace(/\\/g, '/'); // Use forward slashes
            const remoteDir = path.dirname(remotePath);
            const info = getFileInfo(localPath);

            // Create remote directory if needed
            if (remoteDir && remoteDir !== '.' && !createdDirs.has(remoteDir)) {
                try {
                    log.info(`Creating directory: ${remoteDir}...`);
                    await client.ensureDir(remoteDir);
                    await client.cd(config.remoteDir); // Go back to root
                    createdDirs.add(remoteDir);
                    log.success(`Created directory: ${remoteDir}`);
                } catch (err) {
                    // Directory might already exist
                }
            }

            log.info(`Uploading: ${file} (${info.sizeFormatted})...`);
            
            const startTime = Date.now();
            await client.uploadFrom(localPath, remotePath);
            const duration = ((Date.now() - startTime) / 1000).toFixed(2);
            
            log.success(`Uploaded: ${file} → ${remotePath} (${duration}s)`);
            uploadedCount++;
            totalSize += info.size;
        }

        // Summary
        log.header('✨ DEPLOYMENT COMPLETE');
        const version = Date.now();
        console.log(`📊 Summary:`);
        console.log(`   ✅ Files uploaded: ${uploadedCount}`);
        console.log(`   📦 Total size: ${(totalSize / 1024).toFixed(2)} KB`);
        console.log(`   🔖 Version: ${version}`);
        console.log(`   🌐 URL: https://rinmukt.com/`);
        
        log.header('🧹 CACHE CLEARING');
        console.log(`${colors.yellow}To clear Hostinger cache:${colors.reset}`);
        console.log(`   1. Go to: https://hpanel.hostinger.com/`);
        console.log(`   2. Select your website`);
        console.log(`   3. Advanced → Cache Manager → Flush Cache`);
        console.log(`   OR`);
        console.log(`   4. Visit: https://rinmukt.com/?v=${version}`);
        console.log(`      (Cache-busting URL)\n`);
        
        console.log(`🎉 Your website is now live!\n`);

        return true;

    } catch (error) {
        log.error(`Deployment failed: ${error.message}`);
        
        if (error.code === 530) {
            log.error('Authentication failed. Check your username and password.');
        } else if (error.code === 'ENOTFOUND') {
            log.error('Could not resolve FTP host. Check your internet connection.');
        } else if (error.code === 'ECONNREFUSED') {
            log.error('Connection refused. The FTP server may be down.');
        }
        
        return false;
    } finally {
        client.close();
        log.info('FTP connection closed.');
    }
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================
async function main() {
    console.log('\n');
    log.header('🏠 SMART EMI CALCULATOR - DEPLOYMENT');
    console.log(`📅 ${new Date().toLocaleString()}\n`);

    if (!validateConfig()) {
        process.exit(1);
    }

    const success = await deploy();
    process.exit(success ? 0 : 1);
}

main().catch(error => {
    log.error(`Unexpected error: ${error.message}`);
    process.exit(1);
});
