// Cria uma hamburgueria de demonstração: login demo@cardapio.app / demo12345
const { db, tx } = require('./db');
const { hashPassword } = require('./auth');

const EMAIL = 'demo@cardapio.app';
if (db.prepare('SELECT 1 FROM users WHERE email = ?').get(EMAIL)) {
  console.log('Dados de demonstração já existem. Acesse /m/burger-house');
  process.exit(0);
}

const img = (id) => `https://images.unsplash.com/${id}?w=600&q=70&auto=format&fit=crop`;

tx(() => {
  const uid = Number(db.prepare('INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)')
    .run('Demo', EMAIL, hashPassword('demo12345')).lastInsertRowid);
  const rid = Number(db.prepare(
    `INSERT INTO restaurants (owner_id, slug, name, description, cover_url, primary_color, whatsapp, address,
     opening_hours, delivery_fee_cents, min_order_cents, trial_ends_at)
     VALUES (?, 'burger-house', 'Burger House', 'Hambúrgueres artesanais na brasa desde 2015', ?, '#e4572e',
     '11999999999', 'Rua das Flores, 123 - Centro', 'Ter a Dom, 18h às 23h30', 700, 2000, datetime('now', '+365 days'))`
  ).run(uid, img('photo-1550547660-d9450f859349')).lastInsertRowid);

  const cat = (name, pos) => Number(db.prepare('INSERT INTO categories (restaurant_id, name, position) VALUES (?, ?, ?)')
    .run(rid, name, pos).lastInsertRowid);
  let pos = 0;
  const prod = (catId, name, desc, price, image, addons = []) => {
    const pid = Number(db.prepare(
      `INSERT INTO products (restaurant_id, category_id, name, description, price_cents, image_url, position)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).run(rid, catId, name, desc, price, image, ++pos).lastInsertRowid);
    for (const [n, p] of addons) db.prepare('INSERT INTO product_addons (product_id, name, price_cents) VALUES (?, ?, ?)').run(pid, n, p);
  };

  const burgerAddons = [['Bacon extra', 500], ['Queijo cheddar extra', 400], ['Ovo', 300], ['Carne extra 150g', 900]];
  const burgers = cat('Hambúrgueres', 1);
  prod(burgers, 'Clássico', 'Pão brioche, blend 150g, queijo prato, alface, tomate e maionese da casa.', 3290, img('photo-1568901346375-23c9450c58cd'), burgerAddons);
  prod(burgers, 'Bacon Lovers', 'Blend 180g, cheddar derretido, bacon crocante e cebola caramelizada.', 3990, img('photo-1553979459-d2229ba7433b'), burgerAddons);
  prod(burgers, 'Duplo Smash', 'Dois smash de 90g, queijo americano, picles e molho especial.', 3690, img('photo-1586190848861-99aa4a171e90'), burgerAddons);
  prod(burgers, 'Veggie', 'Hambúrguer de grão-de-bico, rúcula, tomate seco e maionese verde.', 3490, img('photo-1520072959219-c595dc870360'));

  const sides = cat('Porções', 2);
  prod(sides, 'Batata frita', 'Porção de 300g com sal e alecrim.', 1890, img('photo-1573080496219-bb080dd4f877'), [['Cheddar e bacon', 800]]);
  prod(sides, 'Onion rings', 'Anéis de cebola empanados, acompanha molho barbecue.', 2190, img('photo-1639024471283-03518883512d'));

  const drinks = cat('Bebidas', 3);
  prod(drinks, 'Refrigerante lata', 'Coca-Cola, Guaraná ou Sprite — informe nas observações.', 690, img('photo-1622483767028-3f66f32aef97'));
  prod(drinks, 'Milkshake', 'Chocolate, morango ou ovomaltine. 400ml.', 1990, img('photo-1572490122747-3968b75cc699'));
});

console.log('Demonstração criada! Login: demo@cardapio.app / demo12345 — cardápio em /m/burger-house');
