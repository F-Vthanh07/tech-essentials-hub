process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'; // Bypass SSL error for localhost

async function main() {
  // 1. Get all variants to find one to delete
  console.log('Fetching variants...');
  let res = await fetch('https://localhost:7240/api/product-variant/get-all');
  const allVariants = await res.json();
  
  if (!allVariants || allVariants.length === 0) {
    console.log('No variants found.');
    return;
  }
  
  const variant = allVariants[0];
  console.log(`Found variant: ${variant.id} (${variant.name})`);
  
  // 2. Try to delete it
  console.log(`Attempting to delete variant ${variant.id}...`);
  res = await fetch(`https://localhost:7240/api/product-variant/delete/${variant.id}`, {
    method: 'DELETE',
  });
  
  console.log('Status:', res.status);
  const text = await res.text();
  console.log('Response:', text);
}

main().catch(console.error);
