import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Função para validar e limpar a URL
const sanitizeSupabaseUrl = (url?: string) => {
  if (!url) return null;
  let cleanUrl = url.trim();
  // Remove trailing slashes
  cleanUrl = cleanUrl.replace(/\/+$/, "");
  // Remove /rest/v1 if included
  cleanUrl = cleanUrl.replace(/\/rest\/v1$/, "");
  
  if (cleanUrl.startsWith('http://') || cleanUrl.startsWith('https://')) {
    return cleanUrl;
  }
  return null;
};

const supabaseUrlRaw = process.env.VITE_SUPABASE_URL;
const supabaseUrl = sanitizeSupabaseUrl(supabaseUrlRaw);
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

let supabase: any = null;

if (supabaseUrl && supabaseAnonKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
    console.log(`Supabase inicializado com URL: ${supabaseUrl}`);
  } catch (err) {
    console.error("Erro crítico ao inicializar Supabase:", err);
  }
} else {
  console.warn("AVISO: Supabase não inicializado. Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY nos Secrets.");
}

const DB_FILE = "./db.json";

async function loadDb() {
  try {
    const data = await fs.readFile(DB_FILE, "utf-8");
    if (!data.trim()) throw new Error("Empty database file");
    const parsed = JSON.parse(data);
    console.log("Database loaded successfully with", parsed.products?.length, "products");
    return parsed;
  } catch (e: any) {
    if (e.code === 'ENOENT') {
      console.log("Database file not found, creating with defaults");
    } else {
      console.error("Error loading database, using defaults to prevent crash:", e.message);
    }
    const defaults = {
      products: [
        {
          id: 1,
          name: 'Camiseta Classic White',
          product_id: 1,
          name_pt: 'Camiseta Classic White',
          description: 'Camiseta 100% algodão branca com corte premium.',
          price: 89.90,
          stock_quantity: 50,
          image_url: 'https://picsum.photos/seed/shirt1/400/400',
          category_id: 1
        },
        {
          id: 2,
          name: 'Polo Navy Blue',
          product_id: 2,
          name_pt: 'Polo Navy Blue',
          description: 'Camisa polo azul marinho em tecido piquet.',
          price: 129.90,
          stock_quantity: 30,
          image_url: 'https://picsum.photos/seed/polo1/400/400',
          category_id: 2
        },
        {
          id: 3,
          name: 'Camiseta Black Premium',
          product_id: 3,
          name_pt: 'Camiseta Black Premium',
          description: 'Camiseta preta com acabamento de luxo.',
          price: 99.90,
          stock_quantity: 25,
          image_url: 'https://picsum.photos/seed/shirt2/400/400',
          category_id: 1
        }
      ],
      orders: [],
      settings: {
        pixKey: '',
        pixName: 'MaVictor Loja',
        pixCity: 'Sao Paulo',
        whatsapp: '5588999126218',
        logoUrl: '',
        enableCard: true,
        bannerUrl: 'https://i.imgur.com/vPqgz76.png',
        bannerTitle: 'Camisetas e polos',
      },
      users: [],
      carts: {} // userId -> CartItem[]
    };
    // Save defaults immediately if file was missing
    await fs.writeFile(DB_FILE, JSON.stringify(defaults, null, 2));
    return defaults;
  }
}

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Initial data load (sync moved further down)
const db = await loadDb();
let products = db.products || [];
let orders = db.orders || [];
let settings = db.settings || {};
let users = db.users || [];
let carts = db.carts || {};

// Guarantee master admin exists immediately
const ensureAdmin = () => {
  if (!users.find((u: any) => u.email === "mavictorlojaonline@gmail.com")) {
    users.push({
      id: "admin-master",
      email: "mavictorlojaonline@gmail.com",
      password: "mavictor1234",
      role: "admin"
    });
  }
};
ensureAdmin();

async function saveDb() {
  try {
    const data = JSON.stringify({ products, orders, settings, users, carts }, null, 2);
    const tempFile = `${DB_FILE}.tmp`;
    await fs.writeFile(tempFile, data);
    await fs.rename(tempFile, DB_FILE);
    console.log("[DB] Saved successfully");
  } catch (e) {
    console.error("[DB] Failed to save:", e);
  }
}

async function syncFromSupabase() {
  if (!supabase) return;
  try {
    console.log("[SYNC] Starting...");
    
    // Sync Products
    const { data: dbProducts, error: prodError } = await supabase.from('products').select('*');
    if (!prodError && dbProducts && dbProducts.length > 0) {
      products = dbProducts.map(p => ({
        id: p.id,
        name: p.name,
        description: p.description,
        price: p.price,
        image_url: p.image || p.image_url || 'https://picsum.photos/seed/shirt1/400/400',
        category: p.category,
        sizes: p.sizes || [],
        stock_quantity: p.stock_quantity || 0
      }));
      console.log(`[SYNC] Loaded ${dbProducts.length} products.`);
    }

    // Sync Settings
    const { data: dbSettings, error: setError } = await supabase.from('settings').select('*').single();
    if (!setError && dbSettings) {
      settings = { 
        ...settings, 
        pixKey: dbSettings.pix_key || '',
        pixName: dbSettings.pix_name || 'MaVictor Loja',
        pixCity: dbSettings.pix_city || 'Sao Paulo',
        whatsapp: dbSettings.whatsapp || '5588999126218',
        logoUrl: dbSettings.logo_url || '',
        enableCard: dbSettings.enable_card ?? true,
        bannerUrl: dbSettings.banner_url || 'https://i.imgur.com/vPqgz76.png',
        bannerTitle: dbSettings.banner_title || 'Camisetas e polos',
      };
      console.log("[SYNC] Settings loaded.");
    }

    // Sync Users
    const { data: dbUsers, error: usersError } = await supabase.from('users').select('*');
    if (!usersError && dbUsers) {
      users = dbUsers;
      console.log(`[SYNC] Carregados ${dbUsers.length} usuários.`);
    } else if (usersError) {
      console.error("[SYNC] Erro ao carregar usuários:", usersError.message);
    }
    
    ensureAdmin();
  } catch (err) {
    console.warn("[SYNC] Erro inesperado:", err);
  }
}

// Background sync - doesn't block start
syncFromSupabase().then(() => {
  ensureAdmin(); // Run again after sync just in case
  console.log("[SYNC] Background sync completed.");
}).catch(e => console.error("[SYNC] Background sync failed:", e));

// Prevent caching for API routes
app.use("/api", (req, res, next) => {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  next();
});

const httpServer = createServer(app);
const io = new Server(httpServer, {
  maxHttpBufferSize: 1e8, // 100MB
  pingTimeout: 60000,
  pingInterval: 25000,
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  },
  allowEIO3: true
});

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id, "Total clients:", io.engine.clientsCount);
  
  // Send current state immediately on connection to ensure sync
  console.log("Sending initial state to client:", socket.id);
  socket.emit("products_updated", products);
  socket.emit("settings_updated", settings);
  socket.emit("orders_updated", orders);

  socket.on("disconnect", (reason) => {
    console.log("Client disconnected:", socket.id, "Reason:", reason, "Remaining clients:", io.engine.clientsCount);
  });
});

// API Routes
// Diagnostic endpoint to help debug cloud deployments
app.get("/api/debug-status", (req, res) => {
  res.json({
    env: process.env.NODE_ENV,
    supabaseConfigured: !!supabase,
    productsCount: products.length,
    usersCount: users.length,
    ordersCount: orders.length,
    masterAdminExists: users.some(u => u.email === "mavictorlojaonline@gmail.com"),
    timestamp: new Date().toISOString()
  });
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const adminEmail = 'mavictorlojaonline@gmail.com';
    const adminPass = 'mavictor1234';

    if (!email || !password) {
      return res.status(400).json({ error: "Email e senha são obrigatórios." });
    }

    const normalizedEmail = email.toLowerCase().trim();
    console.log(`[AUTH] Login attempt for: ${normalizedEmail}`);

    // 1. Verificar Admin Mestre (Hardcoded)
    if (normalizedEmail === adminEmail.toLowerCase()) {
      if (password === adminPass) {
        console.log(`[AUTH] SUCESSO: Master Admin logado.`);
        return res.json({ id: 'admin-master', email: adminEmail, role: 'admin' });
      } else {
        console.warn(`[AUTH] FALHA: Senha incorreta para Admin Mestre.`);
        return res.status(401).json({ error: "Chave de acesso incorreta." });
      }
    }

    // 2. Procurar na lista local (que é sincronizada com Supabase)
    const user = users.find(u => u.email && u.email.toLowerCase().trim() === normalizedEmail);
    
    if (!user) {
      console.log(`[AUTH] Usuário não encontrado na lista de ${users.length} usuários.`);
      return res.status(404).json({ error: "Usuário não encontrado. Se você é novo, use o botão 'Cadastre-se'." });
    }

    if (user.password !== password) {
      console.log(`[AUTH] Senha incorreta para: ${normalizedEmail}`);
      return res.status(401).json({ error: "Senha incorreta." });
    }

    console.log(`[AUTH] SUCESSO: Cliente logado: ${normalizedEmail}`);
    const { password: _, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (err: any) {
    console.error("[AUTH] Erro interno crítico:", err);
    res.status(500).json({ error: "Erro interno no servidor." });
  }
});

app.post("/api/auth/register", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email e senha são obrigatórios." });
    }

    console.log(`[AUTH] Tentando registrar novo usuário: ${email}`);

    if (users.some(u => u.email && u.email.toLowerCase() === email.toLowerCase())) {
      console.log(`[AUTH] Erro: Usuário ${email} já existe.`);
      return res.status(400).json({ error: "Este email já está cadastrado." });
    }

    const newUser = { 
      id: Math.random().toString(36).substr(2, 9), 
      email: email.toLowerCase(), 
      password, 
      role: 'client' 
    };
    
    users.push(newUser);
    await saveDb();

    if (supabase) {
      supabase.from('users').insert([{
        id: newUser.id,
        email: newUser.email,
        password: newUser.password,
        role: newUser.role
      }]).then(({ error }) => {
        if (error) console.error("[AUTH] Erro Supabase Sync:", error.message);
        else console.log("[AUTH] Usuário sincronizado no Supabase.");
      }).catch(e => console.error("[AUTH] Falha crítica Supabase Sync:", e));
    }

    console.log(`[AUTH] Registro concluído com sucesso: ${email}`);
    const { password: _, ...userWithoutPassword } = newUser;
    res.status(201).json(userWithoutPassword);
  } catch (err: any) {
    console.error(`[AUTH] Erro interno no cadastro:`, err);
    res.status(500).json({ error: "Erro interno no servidor ao processar cadastro." });
  }
});

// Diagnostic endpoint removed after successful setup


app.patch("/api/orders/:id/status", async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const orderIndex = orders.findIndex(o => o.id === Number(id));
  if (orderIndex === -1) {
    return res.status(404).json({ message: "Pedido não encontrado" });
  }

  const oldStatus = orders[orderIndex].status;
  orders[orderIndex].status = status;

  // Reduced stock logic: only when status changes TO completed
  if (status === 'completed' && oldStatus !== 'completed') {
    const orderItems = orders[orderIndex].items || [];
    
    for (const item of orderItems) {
      const productIndex = products.findIndex(p => p.name === item.name);
      if (productIndex !== -1) {
        // Reduce local stock
        products[productIndex].stock_quantity = Math.max(0, products[productIndex].stock_quantity - item.quantity);
        
        // Update Supabase product stock
        if (supabase) {
          try {
            await supabase
              .from('products')
              .update({ stock_quantity: products[productIndex].stock_quantity })
              .eq('id', products[productIndex].id);
          } catch (e) {
            console.error(`Erro ao atualizar estoque do produto ${item.name}:`, e);
          }
        }
      }
    }
    // Broadcast updated products to all clients
    io.emit("products_updated", products);
  }

  await saveDb();

  // Sync order status with Supabase
  if (supabase) {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', id);
      
      if (error) console.error("Erro ao atualizar status no Supabase:", error.message);
    } catch (e) {
      console.error("Falha na sincronização do status com Supabase:", e);
    }
  }

  io.emit("orderUpdated", orders[orderIndex]);
  res.json(orders[orderIndex]);
});

app.get("/api/cart/:userId", (req, res) => {
  const { userId } = req.params;
  res.json(carts[userId] || []);
});

app.post("/api/cart/:userId", async (req, res) => {
  const { userId } = req.params;
  carts[userId] = req.body; // Expects array of CartItem
  await saveDb();
  res.json({ success: true });
});

app.get("/api/settings", (req, res) => {
  res.json(settings);
});

app.put("/api/settings", async (req, res) => {
  settings = { ...settings, ...req.body };
  await saveDb();
  
  if (supabase) {
    try {
      // Usamos upsert para garantir que o id 1 seja o único registro de configuração
      // Mapeamos camelCase para snake_case do Postgres
      const { error } = await supabase.from('settings').upsert({ 
        id: 1, 
        pix_key: settings.pixKey,
        pix_name: settings.pixName,
        pix_city: settings.pixCity,
        whatsapp: settings.whatsapp,
        logo_url: settings.logoUrl,
        enable_card: settings.enableCard,
        banner_url: settings.bannerUrl,
        banner_title: settings.bannerTitle
      });

      if (error) {
        console.error("Erro Supabase ao salvar configurações:", error.message);
      } else {
        console.log("Configurações sincronizadas com Supabase (Sucesso)");
      }
    } catch (e: any) {
      console.error("Falha ao salvar no Supabase:", e.message);
    }
  }
  
  io.emit("settings_updated", settings);
  res.json(settings);
});

app.get("/api/products", (req, res) => {
  res.json(products);
});

app.post("/api/products", async (req, res) => {
  const newProduct = { ...req.body, id: Date.now() };
  products.push(newProduct);
  await saveDb();

  if (supabase) {
    try {
      const { data: dbProduct, error } = await supabase.from('products').insert([{
        name: newProduct.name,
        description: newProduct.description,
        price: newProduct.price,
        image: newProduct.image_url,
        category: newProduct.category,
        sizes: newProduct.sizes,
        stock_quantity: newProduct.stock_quantity
      }]).select().single();
      
      if (error) throw error;
      if (dbProduct) {
        console.log("Produto salvo no Supabase com ID:", dbProduct.id);
      }
    } catch (e) {
      console.error("Falha ao inserir produto no Supabase:", e);
    }
  }

  console.log(`Product added: ${newProduct.name}. Total products now: ${products.length}.`);
  console.log(`Broadcasting 'products_updated' to ${io.engine.clientsCount} connected devices...`);
  io.emit("products_updated", products);
  res.status(201).json(newProduct);
});

app.put("/api/products/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const updatedProduct = req.body;
  products = products.map(p => p.id === id ? { ...updatedProduct, id } : p);
  await saveDb();

  if (supabase) {
    try {
      const { error } = await supabase.from('products').update({
        name: updatedProduct.name,
        description: updatedProduct.description,
        price: updatedProduct.price,
        image: updatedProduct.image_url,
        category: updatedProduct.category,
        sizes: updatedProduct.sizes,
        stock_quantity: updatedProduct.stock_quantity
      }).eq('id', id);
      if (error) throw error;
    } catch (e) {
      console.error("Falha ao atualizar produto no Supabase:", e);
    }
  }

  console.log(`Product updated: ID ${id}. Broadcasting to ${io.engine.clientsCount} devices...`);
  io.emit("products_updated", products);
  res.json({ success: true });
});

app.delete("/api/products/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  products = products.filter(p => p.id !== id);
  await saveDb();
  console.log(`Product deleted: ID ${id}. Broadcasting to ${io.engine.clientsCount} devices...`);
  io.emit("products_updated", products);
  res.json({ success: true });
});

app.get("/api/orders", (req, res) => {
  res.json(orders);
});

app.post("/api/orders", async (req, res) => {
  const newOrder = { 
    ...req.body, 
    id: Date.now(),
    created_at: req.body.created_at || new Date().toISOString()
  };
  orders.push(newOrder);
  await saveDb();

  if (supabase) {
    try {
      const { error } = await supabase.from('orders').insert([{
        user_email: newOrder.userEmail,
        customer_name: newOrder.customerName,
        total_price: newOrder.totalPrice,
        items: newOrder.items,
        payment_method: newOrder.payment_method,
        status: newOrder.status || 'pending'
      }]);
      if (error) throw error;
      console.log("Pedido salvo no Supabase para:", newOrder.userEmail);
    } catch (e) {
      console.error("Falha ao salvar pedido no Supabase:", e);
    }
  }

  io.emit("orders_updated", orders);
  res.status(201).json(newOrder);
});

app.put("/api/orders/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  orders = orders.map(o => o.id === id ? { ...req.body, id } : o);
  await saveDb();
  io.emit("orders_updated", orders);
  res.json({ success: true });
});

// Vite middleware for development
if (process.env.NODE_ENV !== "production") {
  const { createServer: createViteServer } = await import("vite");
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: "spa",
  });
  // Add cache control to static assets
  app.use((req, res, next) => {
    if (req.url.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/)) {
      res.setHeader("Cache-Control", "public, max-age=0, must-revalidate");
    }
    next();
  });
  app.use(vite.middlewares);
} else {
  const distPath = path.join(__dirname, "dist");
  app.use(express.static(distPath, {
    setHeaders: (res) => {
      res.setHeader("Cache-Control", "public, max-age=0, must-revalidate");
    }
  }));
  app.get("*", (req, res) => {
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
    res.sendFile(path.join(distPath, "index.html"));
  });
}

const PORT = 3000;
httpServer.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
