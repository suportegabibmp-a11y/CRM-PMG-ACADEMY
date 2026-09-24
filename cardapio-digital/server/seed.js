// Cria uma hamburgueria de demonstração: login demo@cardapio.app / demo12345
// Usa o mesmo banco do app (DATABASE_URL do Supabase, se definido).
import process from 'node:process';
import { db } from './db.js';
import { hashPassword } from './auth.js';

const EMAIL = 'demo@cardapio.app';
const img = (id) => `https://images.unsplash.com/${id}?w=600&q=70&auto=format&fit=crop`;

async function main() {
  if (await db.one('SELECT 1 FROM cardapio.users WHERE email = $1', [EMAIL])) {
    console.log('Dados de demonstração já existem. Acesse /m/burger-house');
    return;
  }
  await db.tx(async (q) => {
    const { id: uid } = await q.one('INSERT INTO cardapio.users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id',
      ['Demo', EMAIL, hashPassword('demo12345')]);
    const { id: rid } = await q.one(
      `INSERT INTO cardapio.restaurants (owner_id, slug, name, description, cover_url, primary_color, whatsapp, address,
       opening_hours, delivery_fee_cents, min_order_cents, trial_ends_at)
       VALUES ($1, 'burger-house', 'Burger House', 'Hambúrgueres artesanais na brasa desde 2015', $2, '#e4572e',
       '11999999999', 'Rua das Flores, 123 - Centro', 'Ter a Dom, 18h às 23h30', 700, 2000, now() + interval '365 days')
       RETURNING id`,
      [uid, img('photo-1550547660-d9450f859349')]
    );

    const cat = async (name, pos) => (await q.one(
      'INSERT INTO cardapio.categories (restaurant_id, name, position) VALUES ($1, $2, $3) RETURNING id', [rid, name, pos]
    )).id;
    let pos = 0;
    const prod = async (catId, name, desc, price, image, addons = []) => {
      const { id: pid } = await q.one(
        `INSERT INTO cardapio.products (restaurant_id, category_id, name, description, price_cents, image_url, position)
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
        [rid, catId, name, desc, price, image, ++pos]
      );
      for (const [n, p] of addons) {
        await q.query('INSERT INTO cardapio.product_addons (product_id, name, price_cents) VALUES ($1, $2, $3)', [pid, n, p]);
      }
    };

    const burgerAddons = [['Bacon extra', 500], ['Queijo cheddar extra', 400], ['Ovo', 300], ['Carne extra 150g', 900]];
    const burgers = await cat('Hambúrgueres', 1);
    await prod(burgers, 'Clássico', 'Pão brioche, blend 150g, queijo prato, alface, tomate e maionese da casa.', 3290, img('photo-1568901346375-23c9450c58cd'), burgerAddons);
    await prod(burgers, 'Bacon Lovers', 'Blend 180g, cheddar derretido, bacon crocante e cebola caramelizada.', 3990, img('photo-1553979459-d2229ba7433b'), burgerAddons);
    await prod(burgers, 'Duplo Smash', 'Dois smash de 90g, queijo americano, picles e molho especial.', 3690, img('photo-1586190848861-99aa4a171e90'), burgerAddons);
    await prod(burgers, 'Veggie', 'Hambúrguer de grão-de-bico, rúcula, tomate seco e maionese verde.', 3490, img('photo-1520072959219-c595dc870360'));

    const sides = await cat('Porções', 2);
    await prod(sides, 'Batata frita', 'Porção de 300g com sal e alecrim.', 1890, img('photo-1573080496219-bb080dd4f877'), [['Cheddar e bacon', 800]]);
    await prod(sides, 'Onion rings', 'Anéis de cebola empanados, acompanha molho barbecue.', 2190, img('photo-1639024471283-03518883512d'));

    const drinks = await cat('Bebidas', 3);
    await prod(drinks, 'Refrigerante lata', 'Coca-Cola, Guaraná ou Sprite — informe nas observações.', 690, img('photo-1622483767028-3f66f32aef97'));
    await prod(drinks, 'Milkshake', 'Chocolate, morango ou ovomaltine. 400ml.', 1990, img('photo-1572490122747-3968b75cc699'));
  });
  console.log('Demonstração criada! Login: demo@cardapio.app / demo12345 — cardápio em /m/burger-house');
}

main().then(() => process.exit(0), (err) => { console.error(err); process.exit(1); });
