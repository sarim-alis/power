// ============================================
// 📚 PROFESSIONAL PRODUCT MANAGEMENT COMPONENT
// ============================================
import { useState, useCallback, useEffect } from 'react';
import { 
  Page, 
  Layout, 
  LegacyCard, 
  Grid,
  Button,
  Modal,
  TextField,
  FormLayout,
  Spinner,
  EmptyState,
  Banner,
  Badge,
  Thumbnail,
  LegacyStack,
  TextStyle,
  ButtonGroup,
  Toast,
  Frame,
  SkeletonBodyText,
  SkeletonDisplayText
} from '@shopify/polaris';
import { useAuthenticatedFetch } from '../hooks';

function Products() {
  // ============================================
  // 📚 STATE MANAGEMENT
  // ============================================
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalActive, setModalActive] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    price: '',
    body_html: '',
    handle: ''
  });
  const [updating, setUpdating] = useState(false);
  const [creating, setCreating] = useState(false);
  const [toastActive, setToastActive] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastError, setToastError] = useState(false);
  const [retryingRequest, setRetryingRequest] = useState(false);

  const fetch = useAuthenticatedFetch();

  // ============================================
  // 📚 FETCH PRODUCTS FROM SHOPIFY
  // ============================================
  const fetchProducts = useCallback(async (retryCount = 0) => {
    let shouldRetry = false;
    
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Fetching products from Shopify...');
      
      const response = await fetch('/api/products/all');
      
      // Check if response is OK
      if (!response.ok) {
        // Handle 401 Unauthorized - Session expired
        if (response.status === 401) {
          throw new Error('Session expired. Please refresh the page or reopen the app from Shopify Admin.');
        }
        // Handle 524 timeout specifically
        if (response.status === 524) {
          throw new Error('Request timeout. The server took too long to respond. Try refreshing or check your connection.');
        }
        throw new Error(`Server error: ${response.status} ${response.statusText}`);
      }
      
      // Check content type
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server returned non-JSON response. Please check your connection.');
      }
      
      const data = await response.json();
      
      if (data.success) {
        setProducts(data.data || []);
        console.log(`✅ Loaded ${data.data?.length || 0} products`);
      } else {
        setError(data.error || 'Failed to fetch products');
      }
      
    } catch (err) {
      console.error('❌ Error fetching products:', err);
      
      // Auto-retry once on timeout (524) or network errors
      if (retryCount === 0 && (err.message.includes('524') || err.message.includes('timeout'))) {
        console.log('🔄 Retrying request...');
        shouldRetry = true;
        setRetryingRequest(true);
        setTimeout(() => {
          setRetryingRequest(false);
          fetchProducts(1);
        }, 2000); // Retry after 2 seconds
        return;
      }
      
      setError(err.message || 'Failed to fetch products. Please try again.');
    } finally {
      if (!shouldRetry) {
        setLoading(false);
      }
    }
  }, [fetch]);

  // ============================================
  // 📚 LOAD PRODUCTS ON MOUNT
  // ============================================
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // ============================================
  // 📚 SHOW TOAST NOTIFICATION
  // ============================================
  const showToast = useCallback((message, isError = false) => {
    setToastMessage(message);
    setToastError(isError);
    setToastActive(true);
  }, []);

  // ============================================
  // 📚 OPEN PRODUCT EDIT MODAL
  // ============================================
  const handleProductClick = useCallback((product) => {
    setSelectedProduct(product);
    setFormData({
      id: product.id,
      title: product.title || '',
      price: product.variants?.[0]?.price || '',
      body_html: product.body_html || '',
      handle: product.handle || '',
      image: product.image
    });
    setModalActive(true);
  }, []);

  // ============================================
  // 📚 CLOSE MODAL
  // ============================================
  const handleModalClose = useCallback(() => {
    setModalActive(false);
    setSelectedProduct(null);
    setFormData({
      title: '',
      price: '',
      body_html: '',
      handle: ''
    });
  }, []);

  // ============================================
  // 📚 HANDLE FORM FIELD CHANGES
  // ============================================
  const handleFieldChange = useCallback((field) => (value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }));
  }, []);

  // ============================================
  // 📚 UPDATE PRODUCT
  // ============================================
  const handleUpdateProduct = useCallback(async () => {
    try {
      setUpdating(true);
      
      console.log('🔄 Updating product:', formData.id);
      
      const response = await fetch('/api/product/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        showToast('✅ Product updated successfully!');
        handleModalClose();
        fetchProducts(); // Refresh list
      } else {
        showToast(data.error || 'Failed to update product', true);
      }
      
    } catch (err) {
      console.error('❌ Error updating product:', err);
      showToast('Failed to update product. Please try again.', true);
    } finally {
      setUpdating(false);
    }
  }, [formData, fetch, showToast, handleModalClose, fetchProducts]);

  // ============================================
  // 📚 CREATE NEW PRODUCT
  // ============================================
  const handleCreateProduct = useCallback(async () => {
    try {
      setCreating(true);
      
      console.log('🔄 Creating new product...');
      
      const response = await fetch('/api/products', {
        method: 'POST'
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        showToast('✅ Product created successfully!');
        fetchProducts(); // Refresh list
      } else {
        showToast(data.error || 'Failed to create product', true);
      }
      
    } catch (err) {
      console.error('❌ Error creating product:', err);
      showToast('Failed to create product. Please try again.', true);
    } finally {
      setCreating(false);
    }
  }, [fetch, showToast, fetchProducts]);

  // ============================================
  // 📚 FORMAT PRICE
  // ============================================
  const formatPrice = (price) => {
    return parseFloat(price).toFixed(2);
  };

  // ============================================
  // 📚 RENDER LOADING SKELETON
  // ============================================
  if (loading) {
    return (
      <Page 
        title="Products Management" 
        fullWidth
      >
        <Layout>
          <Layout.Section>
            <LegacyCard sectioned>
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <Spinner size="large" />
                <p style={{ marginTop: '16px', fontSize: '14px' }}>
                  {retryingRequest ? '🔄 Retrying request...' : 'Loading products from Shopify...'}
                </p>
                {retryingRequest && (
                  <p style={{ marginTop: '8px', fontSize: '12px', color: '#6d7175' }}>
                    Previous request timed out. Trying again...
                  </p>
                )}
              </div>
            </LegacyCard>
          </Layout.Section>
          <Layout.Section>
            <Grid>
              {[1, 2, 3, 4].map((i) => (
                <Grid.Cell key={i} columnSpan={{xs: 6, sm: 3, md: 3, lg: 3, xl: 3}}>
                  <LegacyCard sectioned>
                    <SkeletonBodyText lines={4} />
                  </LegacyCard>
                </Grid.Cell>
              ))}
            </Grid>
          </Layout.Section>
        </Layout>
      </Page>
    );
  }

  // ============================================
  // 📚 RENDER ERROR STATE
  // ============================================
  if (error) {
    const isSessionExpired = error.includes('Session expired') || error.includes('401');
    
    return (
      <Page title="Products Management" fullWidth>
        <Layout>
          <Layout.Section>
            <Banner
              title="Error loading products"
              status="critical"
              onDismiss={() => setError(null)}
            >
              <p>{error}</p>
              <div style={{ marginTop: '12px' }}>
                <ButtonGroup>
                  {isSessionExpired ? (
                    <Button 
                      primary 
                      onClick={() => window.location.reload()}
                    >
                      Refresh Page
                    </Button>
                  ) : (
                    <Button primary onClick={fetchProducts}>Retry</Button>
                  )}
                  <Button onClick={() => setError(null)}>Dismiss</Button>
                </ButtonGroup>
              </div>
            </Banner>
          </Layout.Section>
        </Layout>
      </Page>
    );
  }

  // ============================================
  // 📚 RENDER EMPTY STATE
  // ============================================
  if (!loading && products.length === 0) {
    return (
      <Page title="Products Management" fullWidth>
        <Layout>
          <Layout.Section>
            <LegacyCard sectioned>
              <EmptyState
                heading="No products found"
                image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
              >
                <p>Start by creating your first product.</p>
                <div style={{ marginTop: '16px' }}>
                  <ButtonGroup>
                    <Button primary onClick={handleCreateProduct} loading={creating}>
                      Create Product
                    </Button>
                    <Button onClick={fetchProducts}>Refresh</Button>
                  </ButtonGroup>
                </div>
              </EmptyState>
            </LegacyCard>
          </Layout.Section>
        </Layout>
      </Page>
    );
  }

  // ============================================
  // 📚 RENDER MAIN CONTENT
  // ============================================
  const toastMarkup = toastActive ? (
    <Toast
      content={toastMessage}
      onDismiss={() => setToastActive(false)}
      error={toastError}
    />
  ) : null;

  return (
    <Frame>
      <Page
        title="Products Management"
        fullWidth
        primaryAction={{
          content: 'Create Product',
          onAction: handleCreateProduct,
          loading: creating
        }}
        secondaryActions={[
          {
            content: 'Refresh',
            onAction: fetchProducts
          }
        ]}
      >
        <Layout>
          {/* Stats Section */}
          <Layout.Section>
            <LegacyCard sectioned>
              <LegacyStack vertical spacing="tight">
                <TextStyle variation="strong">Total Products: {products.length}</TextStyle>
                <p style={{ color: '#6d7175', fontSize: '14px' }}>
                  Manage your Shopify products from here
                </p>
              </LegacyStack>
            </LegacyCard>
          </Layout.Section>

          {/* Products Grid */}
          <Layout.Section>
            <Grid>
              {products.map((product) => (
                <Grid.Cell 
                  key={product.id} 
                  columnSpan={{xs: 6, sm: 3, md: 3, lg: 3, xl: 3}}
                >
                  <LegacyCard>
                    <div 
                      onClick={() => handleProductClick(product)}
                      style={{ cursor: 'pointer' }}
                    >
                      <LegacyCard.Section>
                        <LegacyStack vertical spacing="tight">
                          {/* Product Image */}
                          <div style={{ 
                            width: '100%', 
                            height: '200px', 
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: '#f4f6f8',
                            borderRadius: '8px',
                            overflow: 'hidden'
                          }}>
                            {product.image?.src ? (
                              <img 
                                src={product.image.src} 
                                alt={product.title}
                                style={{
                                  width: '100%',
                                  height: '100%',
                                  objectFit: 'cover'
                                }}
                              />
                            ) : (
                              <Thumbnail
                                source="https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-product-1_large.png"
                                alt="No image"
                                size="large"
                              />
                            )}
                          </div>

                          {/* Product Title */}
                          <TextStyle variation="strong">
                            {product.title}
                          </TextStyle>

                          {/* Product Price */}
                          <LegacyStack distribution="equalSpacing" alignment="center">
                            <Badge status="success">
                              ${formatPrice(product.variants?.[0]?.price || '0')}
                            </Badge>
                            <TextStyle variation="subdued">
                              {product.variants?.length || 0} variant(s)
                            </TextStyle>
                          </LegacyStack>

                          {/* Click to edit hint */}
                          <p style={{ 
                            fontSize: '12px', 
                            color: '#6d7175',
                            textAlign: 'center',
                            marginTop: '8px'
                          }}>
                            Click to edit
                          </p>
                        </LegacyStack>
                      </LegacyCard.Section>
                    </div>
                  </LegacyCard>
                </Grid.Cell>
              ))}
            </Grid>
          </Layout.Section>
        </Layout>

        {/* Edit Product Modal */}
        <Modal
          open={modalActive}
          onClose={handleModalClose}
          title="Edit Product"
          primaryAction={{
            content: 'Save Changes',
            onAction: handleUpdateProduct,
            loading: updating
          }}
          secondaryActions={[
            {
              content: 'Cancel',
              onAction: handleModalClose
            }
          ]}
        >
          <Modal.Section>
            <FormLayout>
              {/* Product Image */}
              {formData.image?.src && (
                <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                  <img 
                    src={formData.image.src} 
                    alt={formData.title}
                    style={{
                      maxWidth: '200px',
                      maxHeight: '200px',
                      objectFit: 'contain',
                      borderRadius: '8px',
                      border: '1px solid #e1e3e5'
                    }}
                  />
                </div>
              )}

              <TextField
                label="Product Title"
                value={formData.title}
                onChange={handleFieldChange('title')}
                autoComplete="off"
              />

              <TextField
                label="Price"
                type="number"
                prefix="$"
                value={formData.price}
                onChange={handleFieldChange('price')}
                autoComplete="off"
              />

              <TextField
                label="Description (HTML)"
                value={formData.body_html}
                onChange={handleFieldChange('body_html')}
                multiline={4}
                autoComplete="off"
              />

              <TextField
                label="Handle (URL Slug)"
                value={formData.handle}
                onChange={handleFieldChange('handle')}
                autoComplete="off"
                helpText="URL-friendly version of the product title"
              />
            </FormLayout>
          </Modal.Section>
        </Modal>

        {toastMarkup}
      </Page>
    </Frame>
  );
}

export default Products;