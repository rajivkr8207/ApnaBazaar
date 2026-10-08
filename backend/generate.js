import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function createModule(name) {
  const folder = path.join(__dirname, './src/modules', name);

  fs.mkdirSync(folder, { recursive: true });

  ['controller', 'model', 'route', 'service', 'validate'].forEach((file) => {
    fs.writeFileSync(path.join(folder, `${name}.${file}.js`), '');
  });
}
// createModule('category');
// createModule('product');
// createModule('productStock');
// createModule('productVariant');
// createModule('cart');
// createModule('cartItem');
// createModule('payment');
// createModule('paymentorderitem');


