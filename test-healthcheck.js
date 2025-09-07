const http = require('http');

// Simple healthcheck test
const testHealthcheck = () => {
    const options = {
        hostname: 'localhost',
        port: process.env.PORT || 8080,
        path: '/',
        method: 'GET',
        timeout: 5000
    };

    const req = http.request(options, (res) => {
        console.log(`✅ Healthcheck response: ${res.statusCode}`);

        let data = '';
        res.on('data', (chunk) => {
            data += chunk;
        });

        res.on('end', () => {
            try {
                const response = JSON.parse(data);
                console.log('📊 Healthcheck data:', response);
                if (response.status === 'healthy') {
                    console.log('🎉 Healthcheck PASSED!');
                    process.exit(0);
                } else {
                    console.log('❌ Healthcheck FAILED: Unexpected status');
                    process.exit(1);
                }
            } catch (error) {
                console.log('❌ Healthcheck FAILED: Invalid JSON response');
                process.exit(1);
            }
        });
    });

    req.on('error', (error) => {
        console.log('❌ Healthcheck FAILED: Connection error');
        console.log('Error details:', error.message);
        process.exit(1);
    });

    req.on('timeout', () => {
        console.log('❌ Healthcheck FAILED: Timeout');
        req.destroy();
        process.exit(1);
    });

    req.end();
};

// Run test
console.log('🩺 Testing healthcheck endpoint...');
testHealthcheck();
