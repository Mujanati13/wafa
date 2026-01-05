import http from 'http';

function makeRequest(method, path, data) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5010,
      path: '/api/v1' + path,
      method: method,
      headers: { 'Content-Type': 'application/json' }
    };
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, data: JSON.parse(body) }); }
        catch(e) { resolve({ status: res.statusCode, data: body }); }
      });
    });
    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function test() {
  try {
    const modulesRes = await makeRequest('GET', '/modules');
    const modules = modulesRes.data?.data || [];
    console.log('Modules found:', modules.length);
    if (modules.length === 0) {
      console.log('No modules found');
      return;
    }
    const moduleId = modules[0]._id;
    console.log('Using module:', modules[0].name);

    console.log('\n--- Test 1: Get all categories ---');
    const getAllRes = await makeRequest('GET', '/course-categories');
    console.log('Status:', getAllRes.status, '- Count:', getAllRes.data?.data?.length || 0);

    console.log('\n--- Test 2: Create category ---');
    const createRes = await makeRequest('POST', '/course-categories', { name: 'Cardiologie Test', moduleId });
    console.log('Status:', createRes.status, '- Created:', createRes.data?.data?.name);
    const categoryId = createRes.data?.data?._id;

    if (!categoryId) {
      console.log('Error creating category:', createRes.data);
      return;
    }

    console.log('\n--- Test 3: Get by ID ---');
    const getByIdRes = await makeRequest('GET', '/course-categories/' + categoryId);
    console.log('Status:', getByIdRes.status, '- Name:', getByIdRes.data?.data?.name);

    console.log('\n--- Test 4: Update ---');
    const updateRes = await makeRequest('PUT', '/course-categories/' + categoryId, { name: 'Cardiologie Updated', moduleId });
    console.log('Status:', updateRes.status, '- Updated:', updateRes.data?.data?.name);

    console.log('\n--- Test 5: Delete ---');
    const deleteRes = await makeRequest('DELETE', '/course-categories/' + categoryId);
    console.log('Status:', deleteRes.status, '- Message:', deleteRes.data?.message);

    console.log('\n✅ All category API tests passed!');
  } catch (err) { 
    console.error('Error:', err.message); 
  }
}

test();
