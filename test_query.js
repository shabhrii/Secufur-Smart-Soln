const supabaseUrl = 'https://hhnxybotmyszaxchhqvy.supabase.co';
const supabaseKey = 'sb_publishable_0obFgE1lK3qr7ytP_ZZngQ_-GFCE8HO';

const query = `
  *,
  categories ( id, name, slug ),
  sellers ( id, store_name, logo_url ),
  product_images ( id, image_url, is_primary, sort_order )
`.replace(/\s+/g, '');

fetch(`${supabaseUrl}/rest/v1/products?select=${encodeURIComponent(query)}&status=eq.active&slug=eq.harrah`, {
  headers: {
    'apikey': supabaseKey,
    'Authorization': `Bearer ${supabaseKey}`
  }
}).then(res => res.json()).then(res => {
  console.log("Query Result:", JSON.stringify(res, null, 2));
}).catch(console.error);
