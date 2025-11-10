# App Proxy Test Guide

## Step-by-Step Testing

### Method 1: Browser Test (Easiest)

1. **Browser kholo** (Chrome/Firefox/Edge)

2. **Address bar me yeh URL paste karo:**
   ```
   https://reviews-sum-test-store.myshopify.com/apps/shop-dash/api/app-proxy?shop=reviews-sum-test-store.myshopify.com
   ```

3. **Enter press karo**

4. **Agar store password protected hai:**
   - Store password enter karo
   - Phir URL dobara open karo

5. **Expected Result:**
   ```json
   {
     "success": true,
     "message": "App Proxy is working!",
     "shop": "reviews-sum-test-store.myshopify.com",
     "timestamp": "2024-...",
     "data": {
       "note": "Yeh data App Proxy se aa raha hai",
       "example": "Aap yahan se koi bhi data return kar sakte ho"
     }
   }
   ```

### Method 2: Terminal Test (PowerShell)

PowerShell me yeh command chalao:

```powershell
curl "https://reviews-sum-test-store.myshopify.com/apps/shop-dash/api/app-proxy?shop=reviews-sum-test-store.myshopify.com"
```

### Method 3: JavaScript Test (Browser Console)

1. Browser me storefront page kholo
2. F12 press karo (Developer Tools)
3. Console tab me yeh code paste karo:

```javascript
fetch('https://reviews-sum-test-store.myshopify.com/apps/shop-dash/api/app-proxy?shop=reviews-sum-test-store.myshopify.com')
  .then(response => response.json())
  .then(data => console.log('App Proxy Response:', data))
  .catch(error => console.error('Error:', error));
```

## Troubleshooting

### Error: "Store password protected"
- Store password enter karo
- Ya store ko public karo (Admin → Online Store → Preferences)

### Error: "404 Not Found"
- Check karo ke `shopify.app.toml` me `prefix = "shop-dash"` hai
- App restart karo (`shopify app dev`)

### Error: "500 Internal Server Error"
- Terminal me backend logs check karo
- Cloudflared URL sahi hai ya nahi check karo

## URL Breakdown

```
https://reviews-sum-test-store.myshopify.com
  /apps/                    ← Shopify App Proxy base path
  shop-dash/                ← prefix (shopify.app.toml se)
  api/                      ← subpath (shopify.app.toml se)
  app-proxy                 ← route (backend /api/app-proxy se)
  ?shop=reviews-sum-test-store.myshopify.com  ← query parameter
```

