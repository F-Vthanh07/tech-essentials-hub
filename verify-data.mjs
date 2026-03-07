process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const BASE = 'https://localhost:7240';
async function get(path) { const r = await fetch(`${BASE}${path}`); return r.json(); }
async function main() {
  const apis = [
    '/api/brand/get-all',
    '/api/category/get-all',
    '/api/device/get-all',
    '/api/attributes/get-all',
    '/api/product/get-all',
    '/api/product-variant/get-all',
    '/api/product-compatibility/get-all',
    '/api/product-attribute/get-all',
  ];
  for (const path of apis) {
    const data = await get(path);
    console.log(`\n=== ${path} (${data.length} records) ===`);
    if (data.length > 0) {
      // Print first record fully, rest just count
      console.log('FIRST RECORD:');
      console.log(JSON.stringify(data[0], null, 2));
      if (data.length > 1) console.log(`... and ${data.length - 1} more records`);
    } else {
      console.log('EMPTY');
    }
  }
}
main().catch(console.error);
