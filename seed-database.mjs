// Seed script - creates test data via backend API
// Run with: node seed-database.mjs

// Disable TLS verification for self-signed cert
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const BASE = 'https://localhost:7240';

async function post(path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  try { return JSON.parse(text); } catch { return text; }
}

async function get(path) {
  const res = await fetch(`${BASE}${path}`);
  return res.json();
}

async function main() {
  console.log('=== SEEDING DATABASE ===\n');

  // 1. Create Brands
  console.log('--- Creating Brands ---');
  const brandNames = [
    { name: 'UAG', description: 'Urban Armor Gear - Premium protection', logoUrl: 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=100&h=100&fit=crop' },
    { name: 'Anker', description: 'Charging & Audio solutions', logoUrl: 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=100&h=100&fit=crop' },
    { name: 'Tomtoc', description: 'Bags & Sleeves for tech', logoUrl: 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=100&h=100&fit=crop' },
    { name: 'Spigen', description: 'Cases & Screen protectors', logoUrl: 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=100&h=100&fit=crop' },
    { name: 'Belkin', description: 'Charging & Accessories', logoUrl: 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=100&h=100&fit=crop' },
    { name: 'Mophie', description: 'Power & Protection', logoUrl: 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=100&h=100&fit=crop' },
  ];
  const brands = [];
  for (const b of brandNames) {
    const r = await post('/api/brand/create', b);
    brands.push(r);
    console.log(`  Brand: ${r.name} -> ${r.id}`);
  }

  // 2. Create Categories
  console.log('\n--- Creating Categories ---');
  const catNames = [
    { parentId: null, name: 'Op lung', slug: 'op-lung' },
    { parentId: null, name: 'Sac va Cap', slug: 'sac-va-cap' },
    { parentId: null, name: 'Tui va Balo', slug: 'tui-va-balo' },
    { parentId: null, name: 'Am thanh', slug: 'am-thanh' },
    { parentId: null, name: 'Dan man hinh', slug: 'dan-man-hinh' },
    { parentId: null, name: 'Gia do', slug: 'gia-do' },
  ];
  const categories = [];
  for (const c of catNames) {
    const r = await post('/api/category/create', c);
    categories.push(r);
    console.log(`  Category: ${r.name} -> ${r.id}`);
  }

  // 3. Create Devices
  console.log('\n--- Creating Devices ---');
  const deviceNames = [
    { name: 'iPhone 16 Pro Max', description: 'Apple iPhone 16 Pro Max' },
    { name: 'iPhone 16 Pro', description: 'Apple iPhone 16 Pro' },
    { name: 'iPhone 16', description: 'Apple iPhone 16' },
    { name: 'iPhone 15 Pro Max', description: 'Apple iPhone 15 Pro Max' },
    { name: 'iPad Pro M4', description: 'Apple iPad Pro M4' },
    { name: 'MacBook Pro 16', description: 'Apple MacBook Pro 16 inch' },
    { name: 'MacBook Air M3', description: 'Apple MacBook Air M3' },
    { name: 'Apple Watch Ultra 2', description: 'Apple Watch Ultra 2' },
    { name: 'AirPods Pro 2', description: 'Apple AirPods Pro 2nd Generation' },
    { name: 'Universal', description: 'Compatible with all devices' },
  ];
  const devices = [];
  for (const d of deviceNames) {
    const r = await post('/api/device/create', d);
    devices.push(r);
    console.log(`  Device: ${r.name} -> ${r.id}`);
  }

  // 4. Create Attributes
  console.log('\n--- Creating Attributes ---');
  const attrNames = [
    { name: 'Material', dataType: 'string' },
    { name: 'Weight', dataType: 'string' },
    { name: 'Warranty', dataType: 'string' },
    { name: 'Ports', dataType: 'string' },
    { name: 'Battery', dataType: 'string' },
  ];
  const attributes = [];
  for (const a of attrNames) {
    const r = await post('/api/attributes/create', a);
    attributes.push(r);
    console.log(`  Attribute: ${r.name} -> ${r.id}`);
  }

  // Helper to find IDs
  const brandId = (name) => brands.find(b => b.name === name)?.id;
  const catId = (name) => categories.find(c => c.name === name)?.id;
  const deviceId = (name) => devices.find(d => d.name === name)?.id;

  // 5. Create Products
  console.log('\n--- Creating Products ---');
  const productDefs = [
    { name: 'UAG Monarch Pro Case - iPhone 16 Pro Max', description: 'Op lung chong soc cao cap voi cong nghe chong soc 4m, Carbon Fiber, MagSafe', price: 1890000, isActive: true, brandId: brandId('UAG'), categoryId: catId('Op lung') },
    { name: 'Anker 737 GaNPrime 120W Charger', description: 'Bo sac cong nghe GaN 120W voi 3 cong sac, sac nhanh cho moi thiet bi', price: 1690000, isActive: true, brandId: brandId('Anker'), categoryId: catId('Sac va Cap') },
    { name: 'Tomtoc Defender-A13 Laptop Sleeve 16', description: 'Tui dung laptop 16 inch chong soc 360 do, chat lieu quan dung, khoa YKK', price: 890000, isActive: true, brandId: brandId('Tomtoc'), categoryId: catId('Tui va Balo') },
    { name: 'Spigen Tough Armor MagFit - iPhone 16 Pro', description: 'Op lung chong soc voi Kickstand, MagSafe, cong nghe Air Cushion', price: 790000, isActive: true, brandId: brandId('Spigen'), categoryId: catId('Op lung') },
    { name: 'Belkin BoostCharge Pro 3-in-1 MagSafe', description: 'Sac khong day 3 trong 1 cho iPhone, Apple Watch va AirPods, 15W Fast Charge', price: 3490000, isActive: true, brandId: brandId('Belkin'), categoryId: catId('Sac va Cap') },
    { name: 'UAG Scout Series - Apple Watch Ultra 2', description: 'Op bao ve Apple Watch Ultra 2 thiet ke rugged, nhe, de cai dat', price: 1290000, isActive: true, brandId: brandId('UAG'), categoryId: catId('Op lung') },
    { name: 'Anker Soundcore Liberty 4 NC', description: 'Tai nghe khong day chong on chu dong ANC 2.0, LDAC, pin 50h', price: 2490000, isActive: true, brandId: brandId('Anker'), categoryId: catId('Am thanh') },
    { name: 'Spigen EZ Fit Glas.tR - iPhone 16 Pro Max', description: 'Kinh cuong luc 9H, de dan voi EZ Fit, gom 2 mieng', price: 390000, isActive: true, brandId: brandId('Spigen'), categoryId: catId('Dan man hinh') },
  ];
  const products = [];
  for (const p of productDefs) {
    const r = await post('/api/product/create', p);
    products.push(r);
    console.log(`  Product: ${r.name} -> ${r.id}`);
  }

  // 6. Create Product Variants
  console.log('\n--- Creating Product Variants ---');
  const variantDefs = [
    { productId: products[0]?.id, sku: 'UAG-MON-16PM-BLK', name: 'Black Carbon', stockQuantity: 50, imageUrl: 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=400&h=400&fit=crop', color: 'Black', size: 'iPhone 16 Pro Max', price: 1890000 },
    { productId: products[0]?.id, sku: 'UAG-MON-16PM-RED', name: 'Crimson Red', stockQuantity: 30, imageUrl: 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=400&h=400&fit=crop', color: 'Red', size: 'iPhone 16 Pro Max', price: 1890000 },
    { productId: products[1]?.id, sku: 'ANK-737-120W', name: 'Black', stockQuantity: 100, imageUrl: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400&h=400&fit=crop', color: 'Black', size: 'Universal', price: 1690000 },
    { productId: products[2]?.id, sku: 'TOM-DEF-A13-16-BLK', name: 'Black', stockQuantity: 40, imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop', color: 'Black', size: '16 inch', price: 890000 },
    { productId: products[2]?.id, sku: 'TOM-DEF-A13-16-NVY', name: 'Navy Blue', stockQuantity: 35, imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop', color: 'Navy', size: '16 inch', price: 890000 },
    { productId: products[3]?.id, sku: 'SPG-TA-16P-BLK', name: 'Black', stockQuantity: 80, imageUrl: 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=400&h=400&fit=crop', color: 'Black', size: 'iPhone 16 Pro', price: 790000 },
    { productId: products[4]?.id, sku: 'BLK-3IN1-MAGSAFE', name: 'White', stockQuantity: 25, imageUrl: 'https://images.unsplash.com/photo-1586816879360-004f5b0c51e3?w=400&h=400&fit=crop', color: 'White', size: 'Universal', price: 3490000 },
    { productId: products[5]?.id, sku: 'UAG-SCT-AWU2-BLK', name: 'Black', stockQuantity: 20, imageUrl: 'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=400&h=400&fit=crop', color: 'Black', size: 'Apple Watch Ultra 2', price: 1290000 },
    { productId: products[6]?.id, sku: 'ANK-LIB4-NC-BLK', name: 'Midnight Black', stockQuantity: 60, imageUrl: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400&h=400&fit=crop', color: 'Black', size: 'Universal', price: 2490000 },
    { productId: products[6]?.id, sku: 'ANK-LIB4-NC-WHT', name: 'Cloud White', stockQuantity: 45, imageUrl: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400&h=400&fit=crop', color: 'White', size: 'Universal', price: 2490000 },
    { productId: products[7]?.id, sku: 'SPG-EZ-16PM', name: 'Clear', stockQuantity: 200, imageUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop', color: 'Clear', size: 'iPhone 16 Pro Max', price: 390000 },
  ];
  const variants = [];
  for (const v of variantDefs) {
    if (!v.productId) { console.log('  SKIP variant - no productId'); continue; }
    const r = await post('/api/product-variant/create', v);
    variants.push(r);
    console.log(`  Variant: ${r.name} (${r.sku}) -> ${r.id}`);
  }

  // 7. Create Product Compatibility
  console.log('\n--- Creating Product Compatibility ---');
  const compatDefs = [
    { productId: products[0]?.id, deviceId: deviceId('iPhone 16 Pro Max'), note: 'Perfect fit' },
    { productId: products[1]?.id, deviceId: deviceId('Universal'), note: 'Works with all USB-C devices' },
    { productId: products[2]?.id, deviceId: deviceId('MacBook Pro 16'), note: 'Perfect fit for 16 inch' },
    { productId: products[3]?.id, deviceId: deviceId('iPhone 16 Pro'), note: 'Perfect fit' },
    { productId: products[4]?.id, deviceId: deviceId('iPhone 16 Pro Max'), note: 'Supports iPhone MagSafe' },
    { productId: products[4]?.id, deviceId: deviceId('Apple Watch Ultra 2'), note: 'Supports Apple Watch charging' },
    { productId: products[4]?.id, deviceId: deviceId('AirPods Pro 2'), note: 'Supports AirPods charging' },
    { productId: products[5]?.id, deviceId: deviceId('Apple Watch Ultra 2'), note: 'Perfect fit' },
    { productId: products[6]?.id, deviceId: deviceId('Universal'), note: 'Bluetooth 5.3' },
    { productId: products[7]?.id, deviceId: deviceId('iPhone 16 Pro Max'), note: 'Perfect fit' },
  ];
  for (const c of compatDefs) {
    if (!c.productId || !c.deviceId) { console.log('  SKIP compat - missing IDs'); continue; }
    const r = await post('/api/product-compatibility/create', c);
    console.log(`  Compat: ${r.id}`);
  }

  // 8. Create Product Attributes
  console.log('\n--- Creating Product Attributes ---');
  const prodAttrDefs = [
    { productId: products[0]?.id, attributeId: attributes[0]?.id, value: 'Carbon Fiber + Polycarbonate' },
    { productId: products[0]?.id, attributeId: attributes[2]?.id, value: '12 months' },
    { productId: products[1]?.id, attributeId: attributes[3]?.id, value: '2x USB-C + 1x USB-A' },
    { productId: products[1]?.id, attributeId: attributes[1]?.id, value: '187g' },
    { productId: products[6]?.id, attributeId: attributes[4]?.id, value: '50 hours' },
  ];
  for (const pa of prodAttrDefs) {
    if (!pa.productId || !pa.attributeId) { console.log('  SKIP prodAttr - missing IDs'); continue; }
    const r = await post('/api/product-attribute/create', pa);
    console.log(`  ProdAttr: ${r.id}`);
  }

  // === NOW VERIFY WITH GET ALL ===
  console.log('\n\n=== VERIFYING WITH GET ALL ===\n');

  const apis = [
    { name: 'Brands', path: '/api/brand/get-all' },
    { name: 'Categories', path: '/api/category/get-all' },
    { name: 'Devices', path: '/api/device/get-all' },
    { name: 'Attributes', path: '/api/attributes/get-all' },
    { name: 'Products', path: '/api/product/get-all' },
    { name: 'ProductVariants', path: '/api/product-variant/get-all' },
    { name: 'ProductCompatibility', path: '/api/product-compatibility/get-all' },
    { name: 'ProductAttributes', path: '/api/product-attribute/get-all' },
  ];

  for (const api of apis) {
    const data = await get(api.path);
    console.log(`\n--- ${api.name} (${data.length} records) ---`);
    console.log(JSON.stringify(data, null, 2));
  }

  console.log('\n=== SEED COMPLETE ===');
}

main().catch(console.error);
