// Test syntax by requiring the main file
try {
    require('./index.js');
    console.log('✅ Syntax is correct!');
} catch (error) {
    console.error('❌ Syntax error:', error.message);
    console.error('Line:', error.stack.split('\n')[1]);
}
