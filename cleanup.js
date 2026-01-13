/**
 * Cleanup Script - Remove WordPress files from server
 * Keeps only: index.html, .htaccess
 */

const { Client } = require('basic-ftp');
require('dotenv').config();

// Files to KEEP (everything else will be deleted)
const KEEP_FILES = [
    'index.html',
    '.htaccess'
];

async function cleanup() {
    const client = new Client();
    // client.ftp.verbose = true;
    
    try {
        console.log('\n========================================');
        console.log('  SERVER CLEANUP - Remove WordPress');
        console.log('========================================\n');
        
        // Connect
        console.log('Connecting to FTP server...');
        await client.access({
            host: process.env.FTP_HOST,
            user: process.env.FTP_USER,
            password: process.env.FTP_PASSWORD,
            secure: false
        });
        console.log('Connected!\n');
        
        // List all files
        const list = await client.list();
        
        // Separate files to keep vs delete
        const toKeep = list.filter(f => KEEP_FILES.includes(f.name));
        const toDelete = list.filter(f => !KEEP_FILES.includes(f.name));
        
        console.log('FILES TO KEEP:');
        toKeep.forEach(f => console.log('  [KEEP] ' + f.name));
        
        console.log('\nFILES TO DELETE:');
        toDelete.forEach(f => {
            const type = f.isDirectory ? '[DIR]' : '[FILE]';
            console.log('  [DELETE] ' + type + ' ' + f.name);
        });
        
        console.log('\n----------------------------------------');
        console.log('Total to delete: ' + toDelete.length + ' items');
        console.log('----------------------------------------\n');
        
        // Check for --dry-run flag
        if (process.argv.includes('--dry-run')) {
            console.log('DRY RUN - No files deleted');
            console.log('Run without --dry-run to actually delete files');
            return;
        }
        
        // Delete files and directories
        console.log('Starting deletion...\n');
        
        for (const item of toDelete) {
            try {
                if (item.isDirectory) {
                    console.log('Deleting directory: ' + item.name + '...');
                    await client.removeDir(item.name);
                    console.log('  Deleted: ' + item.name);
                } else {
                    console.log('Deleting file: ' + item.name + '...');
                    await client.remove(item.name);
                    console.log('  Deleted: ' + item.name);
                }
            } catch (err) {
                console.log('  Error deleting ' + item.name + ': ' + err.message);
            }
        }
        
        console.log('\n========================================');
        console.log('  CLEANUP COMPLETE!');
        console.log('========================================');
        console.log('\nRemaining files on server:');
        
        const remaining = await client.list();
        remaining.forEach(f => console.log('  ' + f.name));
        
    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        client.close();
    }
}

cleanup();
