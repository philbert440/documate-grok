const Database = require('./database');

async function checkDatabase() {
  const db = new Database();
  
  try {
    console.log('Checking database contents...');
    
    // Check all projects
    const projects = await db.all('SELECT DISTINCT project FROM pages');
    console.log('Projects found:', projects);
    
    // Check pages for default project
    const pages = await db.getPagesByProject('default');
    console.log(`Found ${pages.length} pages in default project`);
    
    if (pages.length > 0) {
      console.log('Sample page:');
      console.log('Path:', pages[0].path);
      console.log('Title:', pages[0].title);
      console.log('Content preview:', pages[0].content.substring(0, 200) + '...');
      console.log('Has embedding:', !!pages[0].embedding);
    }
    
    // Check total count
    const totalCount = await db.get('SELECT COUNT(*) as count FROM pages');
    console.log('Total pages in database:', totalCount.count);
    
  } catch (error) {
    console.error('Error checking database:', error);
  } finally {
    await db.close();
  }
}

checkDatabase(); 