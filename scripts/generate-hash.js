const crypto = require('crypto');

/**
 * TUATH COIR - Password Hash Generator
 * Use this to generate the SHA-256 hash for your ADMIN_PASSWORD_HASH secret.
 *
 * Usage: node scripts/generate-hash.js <your_password>
 */

const password = process.argv[2];

if (!password) {
  console.log('❌ Error: Please provide a password.');
  console.log('Usage: node scripts/generate-hash.js <your_password>');
  process.exit(1);
}

const hash = crypto.createHash('sha256').update(password).digest('hex');

console.log('═══════════════════════════════════════════════════════════════');
console.log('TUATH COIR - ADMIN PASSWORD HASH');
console.log('═══════════════════════════════════════════════════════════════');
console.log('');
console.log('Your Hash:');
console.log(hash);
console.log('');
console.log('Next Steps:');
console.log('1. Copy the hash above.');
console.log('2. Run: wrangler secret put ADMIN_PASSWORD_HASH');
console.log('3. Paste the hash when prompted.');
console.log('');
console.log('═══════════════════════════════════════════════════════════════');
