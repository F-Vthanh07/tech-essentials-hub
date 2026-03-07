process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const fs = require('fs');
const BASE = 'https://localhost:7240';
async function main() {
  const apis = {
    'products': '/api/product/get-all',
    'variants': '/api/product-variant/get-all',
    'brands': '/api/brand/get-all',
    'categories': '/api/category/get-all',
    'devices': '/api/device/get-all',
    'compatibility': '/api/product-compatibility/get-all',
    'product-attributes': '/api/product-attribute/get-all',
    'attributes': '/api/attributes/get-all',
    'orders': '/api/order/get-all',
  };
  for (const [name, path] of Object.entries(apis)) {
    const res = await fetch(`${BASE}${path}`);
    const data = await res.json();
    // Only keep first 2 records for readability
    const sample = data.slice(0, 2);
    const output = { totalCount: data.length, sampleRecords: sample };
    fs.writeFileSync(`api-response-${name}.json`, JSON.stringify(output, null, 2), 'utf8');
    console.log(`${name}: ${data.length} records saved`);
  }
}
main().catch(console.error);
