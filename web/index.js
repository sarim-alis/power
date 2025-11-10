// @ts-check
import { join } from "path";
import { readFileSync } from "fs";
import express from "express";
import serveStatic from "serve-static";
import shopify from "./shopify.js";
import productCreator from "./product-creator.js";
import PrivacyWebhookHandlers from "./privacy.js";
import mongoose from "mongoose";

// ============================================
// 📚 MONGODB CONNECTION SETUP
// ============================================
// 🔹 MongoDB URI: Aapke local MongoDB ka address
// const MONGO_URI = "mongodb://localhost:27017/shopify-tutorial-app";
const MONGO_URI = "mongodb+srv://sarim:ltBPWPHTceMWonL2@cluster0.lhg8hhc.mongodb.net/power?retryWrites=true&w=majority";


// 🔹 Connection Function: MongoDB se connect karne ke liye
const connectDB = async () => {
  try {
    // mongoose.connect() MongoDB se connection banata hai
    // Note: Mongoose 6+ mein connection options automatically handle hote hain
    await mongoose.connect(MONGO_URI);
    
    console.log("\n🎉 ============================================");
    console.log("   ✅ MongoDB Connected Successfully!");
    console.log("   📍 Database:", mongoose.connection.name);
    console.log("   🔗 Host:", mongoose.connection.host);
    console.log("============================================\n");
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error.message);
    console.error("💡 Tip: Make sure MongoDB is running on your system!");
    console.error("   Run: mongod --dbpath <your-data-path>");
    // Server ko stop na karo, baad mein retry kar sakte hain
  }
};

// 🔹 MongoDB Events: Connection ki monitoring ke liye
mongoose.connection.on('disconnected', () => {
  console.log('⚠️  MongoDB disconnected!');
});

mongoose.connection.on('error', (error) => {
  console.error('❌ MongoDB error:', error);
});

// ============================================
// 📚 USER SCHEMA & MODEL
// ============================================
// 🔹 Schema: Ye define karta hai ke aapka data kaisa hoga
// Jaise blueprint - har user mein kya kya fields honge
const userSchema = new mongoose.Schema({
  fullName: {
    type: String,           // Data type
    required: true,         // Zaroori field (bina iske save nahi hoga)
    trim: true,            // Extra spaces remove karta hai
  },
  email: {
    type: String,
    required: true,
    unique: true,          // Duplicate email allowed nahi hai
    lowercase: true,       // Email ko lowercase mein convert karta hai
    trim: true,
    match: [              // Email validation regex
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email'
    ]
  },
  phone: {
    type: String,
    required: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,         // Minimum 6 characters required
  },
  terms: {
    type: Boolean,
    required: true,
    default: true,
  },
  registeredAt: {
    type: Date,
    default: Date.now,    // Automatically current date set ho jata hai
  }
}, {
  timestamps: true        // Automatically createdAt aur updatedAt fields add kar deta hai
});

// 🔹 Model: Schema se actual model banate hain
// Ye use karke hum database operations perform karte hain (save, find, update, etc.)
const User = mongoose.model('User', userSchema);

// ============================================
// 📚 HELPER FUNCTION: Data ko safely log karna
// ============================================
const logUserData = (user) => {
  return {
    fullName: user.fullName,
    email: user.email,
    phone: user.phone,
    password: '***hidden***', // Security: Password never log nahi karna chahiye
    terms: user.terms,
    registeredAt: user.registeredAt
  };
};

const PORT = parseInt(
  process.env.BACKEND_PORT || process.env.PORT || "3000",
  10
);

const STATIC_PATH =
  process.env.NODE_ENV === "production"
    ? `${process.cwd()}/frontend/dist`
    : `${process.cwd()}/frontend/`;

const app = express();

// ⭐ ZAROORI: Body parsing middleware SABSE PEHLE!
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Set up Shopify authentication and webhook handling
app.get(shopify.config.auth.path, shopify.auth.begin());
app.get(
  shopify.config.auth.callbackPath,
  shopify.auth.callback(),
  shopify.redirectToShopifyOrAppRoot()
);
app.post(
  shopify.config.webhooks.path,
  shopify.processWebhooks({ webhookHandlers: PrivacyWebhookHandlers })
);

// ============================================
// ⭐ APP PROXY ROUTES (PUBLIC - NO AUTH!)
// ============================================
// Ye routes Shopify middleware SE PEHLE hone chahiye!

// GET route - Testing ke liye
app.get('/api/app-proxy', async (req, res) => {
  try {
    console.log('📥 App Proxy GET request');
    console.log('Query params:', req.query);
    console.log('Headers:', JSON.stringify(req.headers, null, 2));
    
    // Simple response for testing
    res.json({
      success: true,
      message: "App Proxy GET is working! ✅",
      timestamp: new Date().toISOString(),
      query: req.query,
      note: "Form data yahan POST request se aayega"
    });
    
  } catch (error) {
    console.error("❌ App Proxy GET error:", error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// POST route - Form data receive karne ke liye
app.post('/api/app-proxy', async (req, res) => {
  try {
    console.log('\n📩 ============ APP PROXY POST REQUEST ============');
    console.log('Timestamp:', new Date().toISOString());
    console.log('Query params:', req.query);
    console.log('Headers:', JSON.stringify(req.headers, null, 2));
    console.log('Body:', JSON.stringify(req.body, null, 2));
    console.log('================================================\n');
    
    // Form data receive karo
    const { fullName, email, phone, password, confirmPassword, terms } = req.body;
    
    // Validation
    if (!fullName || !email || !phone || !password) {
      console.log('❌ Validation failed: Missing required fields');
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    if (password !== confirmPassword) {
      console.log('❌ Validation failed: Passwords do not match');
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match'
      });
    }

    if (!terms) {
      console.log('❌ Validation failed: Terms not accepted');
      return res.status(400).json({
        success: false,
        message: 'You must agree to terms and conditions'
      });
    }

    // ⭐ Log form data (password hidden for security)
    console.log('✅ Form data validated successfully:');
    console.log({
      fullName,
      email,
      phone,
      password: '***hidden***',
      terms,
      timestamp: new Date().toISOString()
    });

    // ============================================
    // 📚 MONGODB: DATA SAVE KARNA
    // ============================================
    console.log('💾 Saving user data to MongoDB...');
    
    try {
      // 🔹 Check: MongoDB connected hai ya nahi
      if (mongoose.connection.readyState !== 1) {
        console.log('⚠️  MongoDB not connected. Attempting to connect...');
        await connectDB();
      }
      
      // 🔹 Step 1: Check karo ke email already exist to nahi karta
      const existingUser = await User.findOne({ email });
      
      if (existingUser) {
        console.log('❌ User already exists with this email:', email);
        return res.status(400).json({
          success: false,
          message: 'This email is already registered. Please use a different email.'
        });
      }
      
      // 🔹 Step 2: Naya user object banao
      // ⚠️ IMPORTANT: Production mein password ko HASH karna chahiye (bcrypt use karke)
      // Abhi learning ke liye plain text save kar rahe hain
      const newUser = new User({
        fullName,
        email,
        phone,
        password,  // ⚠️ TODO: Hash this password using bcrypt
        terms
      });
      
      // 🔹 Step 3: Database mein save karo
      // .save() method MongoDB mein document insert karta hai
      const savedUser = await newUser.save();
      
      console.log('✅ User saved to MongoDB successfully!');
      console.log('📋 Saved User Data:', logUserData(savedUser));
      
      // Success response
      res.status(200).json({
        success: true,
        message: `Registration successful! Welcome, ${fullName}! 🎉`,
        data: {
          id: savedUser._id,              // MongoDB automatically _id generate karta hai
          email: savedUser.email,
          registeredAt: savedUser.registeredAt
        }
      });
      
    } catch (dbError) {
      // Database error handling
      console.error('❌ Database error:', dbError);
      
      // Mongoose validation errors
      if (dbError.name === 'ValidationError') {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: Object.values(dbError.errors).map(err => err.message)
        });
      }
      
      // Duplicate key error (email already exists)
      if (dbError.code === 11000) {
        return res.status(400).json({
          success: false,
          message: 'This email is already registered.'
        });
      }
      
      // Generic database error
      return res.status(500).json({
        success: false,
        message: 'Failed to save user data. Please try again.',
        error: dbError.message
      });
    }
    
  } catch (error) {
    console.error('❌ App Proxy POST error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      success: false,
      message: 'Server error. Please try again later.',
      error: error.message 
    });
  }
});

// ============================================
// ⚠️ PROTECTED ROUTES (WITH AUTH)
// ============================================
// Ye line App Proxy routes KE BAAD honi chahiye!

app.use("/api/*", shopify.validateAuthenticatedSession());

// Store info endpoint (protected)
app.get('/api/store/info', async (req, res) => {
  try {
    const session = res.locals.shopify.session;
    
    if (!session) {
      return res.status(401).json({ error: 'Session not found' });
    }

    const client = new shopify.api.clients.Graphql({
      session: session,
    });

    const storeData = await client.request(`
      query {
        shop {
          name
          myshopifyDomain
          primaryDomain {
            host
            url
          }
          plan {
            displayName
          }
        }
      }
    `);

    res.status(200).json({ 
      storeInfo: storeData.data.shop 
    });
  } catch (error) {
    console.error('Error fetching store info:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to fetch store info',
      details: error.stack 
    });
  }
});

// Products count endpoint (protected)
app.get("/api/products/count", async (_req, res) => {
  const client = new shopify.api.clients.Graphql({
    session: res.locals.shopify.session,
  });

  const countData = await client.request(`
    query shopifyProductCount {
      productsCount {
        count
      }
    }
  `);

  res.status(200).send({ count: countData.data.productsCount.count });
});

// Collections count endpoint (protected)
app.get("/api/collections/count", async (_req, res) => {
  try {
    const client = new shopify.api.clients.Graphql({
      session: res.locals.shopify.session,
    });

    const countData = await client.request(`
      query shopifyCollectionsCount {
        collectionsCount {
          count
        }
      }
    `);

    res.status(200).send({ count: countData.data.collectionsCount.count });
  } catch (error) {
    console.error('Error fetching collections count:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to fetch collections count',
      details: error.stack 
    });
  }
});

// Orders count endpoint (protected)
app.get("/api/orders/count", async (_req, res) => {
  try {
    const client = new shopify.api.clients.Graphql({
      session: res.locals.shopify.session,
    });

    const countData = await client.request(`
      query shopifyOrdersCount {
        ordersCount {
          count
        }
      }
    `);

    const count = countData.data?.ordersCount?.count || 0;
    console.log('Total Orders Count:', count);
    res.status(200).send({ count });
  } catch (error) {
    console.error('Error fetching orders count:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to fetch orders count',
      details: error.stack 
    });
  }
});

// Fulfilled orders count endpoint (protected)
app.get("/api/orders/fulfilled/count", async (_req, res) => {
  try {
    const client = new shopify.api.clients.Graphql({
      session: res.locals.shopify.session,
    });

    let fulfilledCount = 0;
    let hasNextPage = true;
    let cursor = null;

    while (hasNextPage) {
      let query;
      if (cursor) {
        query = `
          query shopifyFulfilledOrdersCount {
            orders(first: 250, after: "${cursor}", query: "fulfillment_status:fulfilled") {
              edges {
                node {
                  id
                }
              }
              pageInfo {
                hasNextPage
                endCursor
              }
            }
          }
        `;
      } else {
        query = `
          query shopifyFulfilledOrdersCount {
            orders(first: 250, query: "fulfillment_status:fulfilled") {
              edges {
                node {
                  id
                }
              }
              pageInfo {
                hasNextPage
                endCursor
              }
            }
          }
        `;
      }

      const ordersData = await client.request(query);

      const orders = ordersData.data?.orders || { edges: [], pageInfo: { hasNextPage: false } };
      fulfilledCount += orders.edges.length;
      hasNextPage = orders.pageInfo?.hasNextPage || false;
      cursor = orders.pageInfo?.endCursor || null;
    }

    console.log('Fulfilled Orders Count:', fulfilledCount);
    res.status(200).json({ count: fulfilledCount });
  } catch (error) {
    console.error('Error fetching fulfilled orders count:', error);
    console.error('Error details:', error.response?.body || error.message);
    res.status(500).json({ 
      error: error.message || 'Failed to fetch fulfilled orders count',
      details: error.stack 
    });
  }
});

// Remaining orders count endpoint (protected)
app.get("/api/orders/remains/count", async (_req, res) => {
  try {
    const client = new shopify.api.clients.Graphql({
      session: res.locals.shopify.session,
    });

    let remainsCount = 0;
    let hasNextPage = true;
    let cursor = null;

    while (hasNextPage) {
      let query;
      if (cursor) {
        query = `
          query shopifyRemainsOrdersCount {
            orders(first: 250, after: "${cursor}", query: "fulfillment_status:unfulfilled OR fulfillment_status:partial") {
              edges {
                node {
                  id
                }
              }
              pageInfo {
                hasNextPage
                endCursor
              }
            }
          }
        `;
      } else {
        query = `
          query shopifyRemainsOrdersCount {
            orders(first: 250, query: "fulfillment_status:unfulfilled OR fulfillment_status:partial") {
              edges {
                node {
                  id
                }
              }
              pageInfo {
                hasNextPage
                endCursor
              }
            }
          }
        `;
      }

      const ordersData = await client.request(query);

      const orders = ordersData.data?.orders || { edges: [], pageInfo: { hasNextPage: false } };
      remainsCount += orders.edges.length;
      hasNextPage = orders.pageInfo?.hasNextPage || false;
      cursor = orders.pageInfo?.endCursor || null;
    }

    console.log('Remains Orders Count:', remainsCount);
    res.status(200).json({ count: remainsCount });
  } catch (error) {
    console.error('Error fetching remains orders count:', error);
    console.error('Error details:', error.response?.body || error.message);
    res.status(500).json({ 
      error: error.message || 'Failed to fetch remains orders count',
      details: error.stack 
    });
  }
});

// All orders endpoint (protected)
app.get("/api/orders/all", async (_req, res) => {
  try {
    const client = new shopify.api.clients.Graphql({
      session: res.locals.shopify.session,
    });

    const ordersData = await client.request(`
      query shopifyOrders {
        orders(first: 50, reverse: true) {
          edges {
            node {
              id
              name
              createdAt
              updatedAt
              totalPriceSet {
                shopMoney {
                  amount
                  currencyCode
                }
              }
              financialStatus
              fulfillmentStatus
              customer {
                firstName
                lastName
                email
              }
              lineItems(first: 10) {
                edges {
                  node {
                    title
                    quantity
                    originalUnitPriceSet {
                      shopMoney {
                        amount
                        currencyCode
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    `);

    const orders = ordersData.data.orders.edges.map(edge => ({
      id: edge.node.id,
      name: edge.node.name,
      createdAt: edge.node.createdAt,
      updatedAt: edge.node.updatedAt,
      totalPrice: edge.node.totalPriceSet.shopMoney.amount,
      currency: edge.node.totalPriceSet.shopMoney.currencyCode,
      financialStatus: edge.node.financialStatus,
      fulfillmentStatus: edge.node.fulfillmentStatus,
      customer: edge.node.customer ? {
        firstName: edge.node.customer.firstName,
        lastName: edge.node.customer.lastName,
        email: edge.node.customer.email,
      } : null,
      lineItems: edge.node.lineItems.edges.map(item => ({
        title: item.node.title,
        quantity: item.node.quantity,
        price: item.node.originalUnitPriceSet.shopMoney.amount,
        currency: item.node.originalUnitPriceSet.shopMoney.currencyCode,
      })),
    }));

    res.status(200).json({ orders });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to fetch orders',
      details: error.stack 
    });
  }
});

// ============================================
// 📚 SHOPIFY PRODUCTS API (Protected)
// ============================================

// GET - Fetch all products from Shopify
app.get("/api/products/all", async (_req, res) => {
  try {
    console.log('📋 Fetching products from Shopify...');
    
    const client = new shopify.api.clients.Graphql({
      session: res.locals.shopify.session,
    });

    // GraphQL query to fetch products
    // 🔹 Fetching only 10 products at a time for better performance
    const productsData = await client.request(`
      query getProducts {
        products(first: 10, sortKey: UPDATED_AT, reverse: true) {
          edges {
            node {
              id
              title
              handle
              bodyHtml
              images(first: 1) {
                edges {
                  node {
                    url
                  }
                }
              }
              variants(first: 1) {
                edges {
                  node {
                    id
                    price
                    sku
                  }
                }
              }
            }
          }
        }
      }
    `);

    // Format the response
    const products = productsData.data.products.edges.map(edge => ({
      id: edge.node.id,
      title: edge.node.title,
      handle: edge.node.handle,
      body_html: edge.node.bodyHtml,
      image: edge.node.images.edges[0] ? {
        src: edge.node.images.edges[0].node.url
      } : null,
      variants: edge.node.variants.edges.map(v => ({
        id: v.node.id,
        price: v.node.price,
        sku: v.node.sku
      }))
    }));

    console.log(`✅ Fetched ${products.length} products`);

    res.status(200).json({
      success: true,
      data: products,
      count: products.length
    });

  } catch (error) {
    console.error('❌ Error fetching products:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch products',
      details: error.stack
    });
  }
});

// PUT - Update product in Shopify
app.put("/api/product/update", async (req, res) => {
  try {
    const { id, title, price, body_html, handle } = req.body;
    
    console.log('🔄 Updating product:', id);

    const client = new shopify.api.clients.Graphql({
      session: res.locals.shopify.session,
    });

    // GraphQL mutation to update product
    const updateData = await client.request(`
      mutation updateProduct($input: ProductInput!) {
        productUpdate(input: $input) {
          product {
            id
            title
            handle
            bodyHtml
          }
          userErrors {
            field
            message
          }
        }
      }
    `, {
      variables: {
        input: {
          id: id,
          title: title,
          bodyHtml: body_html,
          handle: handle
        }
      }
    });

    // Check for errors
    if (updateData.data.productUpdate.userErrors.length > 0) {
      const errors = updateData.data.productUpdate.userErrors;
      console.log('❌ Product update errors:', errors);
      return res.status(400).json({
        success: false,
        error: errors[0].message,
        errors: errors
      });
    }

    console.log('✅ Product updated successfully');

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      product: updateData.data.productUpdate.product
    });

  } catch (error) {
    console.error('❌ Error updating product:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to update product',
      details: error.stack
    });
  }
});

// POST - Create new product in Shopify
app.post("/api/products", async (_req, res) => {
  let status = 200;
  let error = null;

  try {
    await productCreator(res.locals.shopify.session);
  } catch (e) {
    console.log(`Failed to process products/create: ${e.message}`);
    status = 500;
    error = e.message;
  }
  res.status(status).send({ success: status === 200, error });
});

// DELETE - Delete product from Shopify
app.delete("/api/product/delete", async (req, res) => {
  try {
    const { id } = req.body;
    
    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'Product ID is required'
      });
    }

    console.log('🗑️  Deleting product:', id);

    const client = new shopify.api.clients.Graphql({
      session: res.locals.shopify.session,
    });

    const deleteData = await client.request(`
      mutation deleteProduct($input: ProductDeleteInput!) {
        productDelete(input: $input) {
          deletedProductId
          userErrors {
            field
            message
          }
        }
      }
    `, {
      variables: {
        input: {
          id: id
        }
      }
    });

    if (deleteData.data.productDelete.userErrors.length > 0) {
      const errors = deleteData.data.productDelete.userErrors;
      console.log('❌ Product delete errors:', errors);
      return res.status(400).json({
        success: false,
        error: errors[0].message,
        errors: errors
      });
    }

    console.log('✅ Product deleted successfully');

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully',
      deletedId: deleteData.data.productDelete.deletedProductId
    });

  } catch (error) {
    console.error('❌ Error deleting product:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to delete product',
      details: error.stack
    });
  }
});

// ============================================
// 📚 MONGODB USERS API (Protected)
// ============================================

// GET - All Users from MongoDB
app.get("/api/users", async (_req, res) => {
  try {
    console.log('📋 Fetching users from MongoDB...');
    
    // 🔹 Check: MongoDB connected hai ya nahi
    if (mongoose.connection.readyState !== 1) {
      console.log('⚠️  MongoDB not connected. Attempting to connect...');
      await connectDB();
    }
    
    // 🔹 Database se users fetch karo
    // .select('-password') => password field hide karo (security)
    // .sort({ createdAt: -1 }) => Latest users first
    // .limit(100) => Maximum 100 users (performance ke liye)
    const users = await User.find()
      .select('-password')  // Password field remove karo
      .sort({ createdAt: -1 })  // Latest first
      .limit(100)
      .lean();  // Plain JavaScript objects return karo (faster)
    
    console.log(`✅ Fetched ${users.length} users from MongoDB`);
    
    res.status(200).json({
      success: true,
      count: users.length,
      users: users
    });
    
  } catch (error) {
    console.error('❌ Error fetching users:', error);
    res.status(500).json({ 
      success: false,
      error: error.message || 'Failed to fetch users',
      details: error.stack 
    });
  }
});

// GET - Single User by ID
app.get("/api/users/:id", async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`📋 Fetching user with ID: ${id}`);
    
    if (mongoose.connection.readyState !== 1) {
      await connectDB();
    }
    
    const user = await User.findById(id)
      .select('-password')
      .lean();
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    console.log(`✅ Found user: ${user.email}`);
    
    res.status(200).json({
      success: true,
      user: user
    });
    
  } catch (error) {
    console.error('❌ Error fetching user:', error);
    res.status(500).json({ 
      success: false,
      error: error.message || 'Failed to fetch user'
    });
  }
});

// DELETE - Delete User by ID
app.delete("/api/users/:id", async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🗑️  Deleting user with ID: ${id}`);
    
    if (mongoose.connection.readyState !== 1) {
      await connectDB();
    }
    
    const deletedUser = await User.findByIdAndDelete(id);
    
    if (!deletedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    console.log(`✅ User deleted: ${deletedUser.email}`);
    
    res.status(200).json({
      success: true,
      message: 'User deleted successfully',
      user: {
        id: deletedUser._id,
        email: deletedUser.email
      }
    });
    
  } catch (error) {
    console.error('❌ Error deleting user:', error);
    res.status(500).json({ 
      success: false,
      error: error.message || 'Failed to delete user'
    });
  }
});

// Static files and frontend
app.use(shopify.cspHeaders());
app.use(serveStatic(STATIC_PATH, { index: false }));

app.use("/*", shopify.ensureInstalledOnShop(), async (_req, res, _next) => {
  return res
    .status(200)
    .set("Content-Type", "text/html")
    .send(
      readFileSync(join(STATIC_PATH, "index.html"))
        .toString()
        .replace("%VITE_SHOPIFY_API_KEY%", process.env.SHOPIFY_API_KEY || "")
    );
});

// ============================================
// 📚 SERVER START: MongoDB aur Express dono start karo
// ============================================
app.listen(PORT, async () => {
  console.log(`\n✅ ============================================`);
  console.log(`   🚀 Express Server running on port ${PORT}`);
  console.log(`   🔗 App Proxy endpoint: /api/app-proxy`);
  console.log(`   📝 Ready to receive form data!`);
  console.log(`============================================\n`);
  
  // MongoDB connection start karo
  // async/await use kar rahe hain kyunki connection time lagta hai
  await connectDB();
});