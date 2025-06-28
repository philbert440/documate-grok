const Database = require('./database');
const fs = require('fs');
const path = require('path');

async function clearDatabase(options = {}) {
  const db = new Database();

  try {
    console.log('Database clearing utility');
    console.log('=======================');

    if (options.all) {
      // Clear all data
      console.log('Clearing ALL data from database...');
      const result = await db.run('DELETE FROM pages');
      console.log(`Deleted ${result.changes} pages from database`);

      // Reset auto-increment counter
      await db.run('DELETE FROM sqlite_sequence WHERE name = "pages"');
      console.log('Reset auto-increment counter');

    } else if (options.project) {
      // Clear specific project
      console.log(`Clearing data for project: ${options.project}`);
      const result = await db.deletePagesByProject(options.project);
      console.log(`Deleted ${result.changes} pages from project "${options.project}"`);

    } else if (options.path) {
      // Clear specific path
      if (!options.project) {
        console.error('Error: --project is required when using --path');
        process.exit(1);
      }
      console.log(`Clearing data for path: ${options.path} in project: ${options.project}`);
      const result = await db.deletePageByPath(options.project, options.path);
      console.log(`Deleted ${result.changes} pages for path "${options.path}" in project "${options.project}"`);

    } else {
      // Show current database status
      console.log('Current database status:');
      const totalCount = await db.get('SELECT COUNT(*) as count FROM pages');
      console.log(`Total pages: ${totalCount.count}`);

      const projects = await db.all('SELECT DISTINCT project FROM pages');
      console.log('Projects found:', projects.map(p => p.project));

      if (projects.length > 0) {
        for (const project of projects) {
          const projectCount = await db.get('SELECT COUNT(*) as count FROM pages WHERE project = ?', [project.project]);
          console.log(`  - ${project.project}: ${projectCount.count} pages`);
        }
      }

      console.log('\nUsage options:');
      console.log('  --all                    Clear all data from database');
      console.log('  --project <project>      Clear all data for specific project');
      console.log('  --path <path>            Clear specific path (requires --project)');
      console.log('  --confirm                Confirm deletion (required for destructive operations)');
      return;
    }

    // Verify the operation
    if (options.all || options.project || options.path) {
      if (!options.confirm) {
        console.log('\n⚠️  WARNING: This operation will permanently delete data!');
        console.log('Add --confirm flag to proceed with deletion.');
        return;
      }

      console.log('\n✅ Database cleared successfully!');

      // Show updated status
      const totalCount = await db.get('SELECT COUNT(*) as count FROM pages');
      console.log(`Remaining pages: ${totalCount.count}`);
    }

  } catch (error) {
    console.error('Error clearing database:', error);
    process.exit(1);
  } finally {
    await db.close();
  }
}

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    switch (arg) {
      case '--all':
        options.all = true;
        break;
      case '--project':
        options.project = args[++i];
        break;
      case '--path':
        options.path = args[++i];
        break;
      case '--confirm':
        options.confirm = true;
        break;
      case '--help':
      case '-h':
        console.log('Database clearing utility');
        console.log('');
        console.log('Usage: node clear-db.js [options]');
        console.log('');
        console.log('Options:');
        console.log('  --all                    Clear all data from database');
        console.log('  --project <project>      Clear all data for specific project');
        console.log('  --path <path>            Clear specific path (requires --project)');
        console.log('  --confirm                Confirm deletion (required for destructive operations)');
        console.log('  --help, -h               Show this help message');
        console.log('');
        console.log('Examples:');
        console.log('  node clear-db.js                    # Show database status');
        console.log('  node clear-db.js --all --confirm    # Clear all data');
        console.log('  node clear-db.js --project test --confirm  # Clear test project');
        console.log('  node clear-db.js --project default --path file.md --confirm  # Clear specific file');
        process.exit(0);
        break;
      default:
        console.error(`Unknown option: ${arg}`);
        console.error('Use --help for usage information');
        process.exit(1);
    }
  }

  return options;
}

// Run the script
const options = parseArgs();
clearDatabase(options);