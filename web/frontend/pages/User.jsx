import {
  Badge,
  Banner,
  Button,
  ButtonGroup,
  DataTable,
  EmptyState,
  Heading,
  Layout,
  LegacyCard,
  LegacyStack,
  Page,
  Spinner,
  TextStyle
} from "@shopify/polaris";
import { useEffect, useState } from "react";
import { useAuthenticatedFetch } from "../hooks";

function User() {
  // ============================================
  // 📚 STATE MANAGEMENT
  // ============================================
  const [users, setUsers] = useState([]);           // Users data
  const [loading, setLoading] = useState(true);     // Loading state
  const [error, setError] = useState(null);         // Error state
  const [deleting, setDeleting] = useState(null);   // Track which user is being deleted
  
  // Shopify authenticated fetch hook
  const fetch = useAuthenticatedFetch();

  // ============================================
  // 📚 FETCH USERS FROM API
  // ============================================
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Fetching users from API...');
      
      // API call to backend
      const response = await fetch('/api/users');
      
      // Check if response is OK
      if (!response.ok) {
        // Handle 401 Unauthorized - Session expired
        if (response.status === 401) {
          throw new Error('Session expired. Please refresh the page or reopen the app from Shopify Admin.');
        }
        throw new Error(`Server error: ${response.status} ${response.statusText}`);
      }
      
      // Check content type
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server returned non-JSON response. Please check your connection.');
      }
      
      const data = await response.json();
      
      console.log('✅ Response:', data);
      
      if (data.success) {
        setUsers(data.users);
        console.log(`✅ Loaded ${data.users.length} users`);
      } else {
        setError(data.error || 'Failed to fetch users');
      }
      
    } catch (err) {
      console.error('❌ Error fetching users:', err);
      setError(err.message || 'Failed to fetch users. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // 📚 DELETE USER FUNCTION
  // ============================================
  const handleDeleteUser = async (userId, userEmail) => {
    if (!confirm(`Are you sure you want to delete user: ${userEmail}?`)) {
      return;
    }
    
    try {
      setDeleting(userId);
      
      console.log(`🗑️  Deleting user: ${userId}`);
      
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE'
      });
      
      const data = await response.json();
      
      if (data.success) {
        console.log('✅ User deleted successfully');
        // Remove user from state
        setUsers(users.filter(user => user._id !== userId));
      } else {
        alert(`Failed to delete user: ${data.message}`);
      }
      
    } catch (err) {
      console.error('❌ Error deleting user:', err);
      alert('Failed to delete user. Please try again.');
    } finally {
      setDeleting(null);
    }
  };

  // ============================================
  // 📚 FORMAT DATE FUNCTION
  // ============================================
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // ============================================
  // 📚 USEEFFECT: Component mount pe data fetch karo
  // ============================================
  useEffect(() => {
    fetchUsers();
  }, []); // Empty dependency array = run only once on mount

  // ============================================
  // 📚 PREPARE TABLE DATA
  // ============================================
  const tableRows = users.map((user) => [
    // Serial number
    users.indexOf(user) + 1,
    
    // Full Name
    <TextStyle variation="strong">{user.fullName}</TextStyle>,
    
    // Email
    user.email,
    
    // Phone
    user.phone || 'N/A',
    
    // Registered Date
    formatDate(user.registeredAt || user.createdAt),
    
    // Terms Badge
    user.terms ? (
      <Badge tone="success">Accepted</Badge>
    ) : (
      <Badge tone="critical">Not Accepted</Badge>
    ),
    
    // Actions
    <Button
      tone="critical"
      size="slim"
      loading={deleting === user._id}
      onClick={() => handleDeleteUser(user._id, user.email)}
    >
      Delete
    </Button>
  ]);

  // ============================================
  // 📚 RENDER LOADING STATE
  // ============================================
  if (loading) {
    return (
      <Page title="Users Management" fullWidth>
        <Layout>
          <Layout.Section>
            <LegacyCard sectioned>
              <div style={{ textAlign: 'center', padding: '60px 0' }}>
                <Spinner size="large" />
                <div style={{ marginTop: '20px' }}>
                  <p>Loading users from MongoDB...</p>
                </div>
              </div>
            </LegacyCard>
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
      <Page title="Users Management" fullWidth>
        <Layout>
          <Layout.Section>
            <Banner
              title="Error loading users"
              tone="critical"
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
                    <Button primary onClick={fetchUsers}>Retry</Button>
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
  if (users.length === 0) {
    return (
      <Page title="Users Management" fullWidth>
        <Layout>
          <Layout.Section>
            <LegacyCard sectioned>
              <EmptyState
                heading="No users found"
                image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
              >
                <p>No users have registered yet. Users will appear here once they sign up through your storefront.</p>
                <div style={{ marginTop: '16px' }}>
                  <Button onClick={fetchUsers}>Refresh</Button>
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
  return (
    <Page 
      title="Users Management" 
      fullWidth
      primaryAction={{
        content: 'Refresh',
        onAction: fetchUsers,
      }}
    >
      <Layout>
        {/* Stats Card */}
        <Layout.Section>
          <LegacyCard sectioned>
            <LegacyStack vertical spacing="tight">
              <Heading>📊 Statistics</Heading>
              <p>
                Total Registered Users: <TextStyle variation="strong">{users.length}</TextStyle>
              </p>
              <p style={{ color: '#6d7175' }}>
                Latest registration: {users[0] ? formatDate(users[0].createdAt) : 'N/A'}
              </p>
            </LegacyStack>
          </LegacyCard>
        </Layout.Section>

        {/* Users Table */}
        <Layout.Section>
          <LegacyCard>
            <DataTable
              columnContentTypes={[
                'numeric',    // #
                'text',       // Name
                'text',       // Email
                'text',       // Phone
                'text',       // Date
                'text',       // Terms
                'text',       // Actions
              ]}
              headings={[
                '#',
                'Full Name',
                'Email',
                'Phone',
                'Registered',
                'Terms',
                'Actions'
              ]}
              rows={tableRows}
              footerContent={
                <p style={{ fontSize: '0.875rem', color: '#6d7175' }}>
                  Showing {users.length} {users.length === 1 ? 'user' : 'users'}
                </p>
              }
            />
          </LegacyCard>
        </Layout.Section>

        {/* Info Banner */}
        <Layout.Section>
          <Banner tone="info">
            <p>
              💡 <strong>Tip:</strong> This data is fetched from MongoDB in real-time. 
              Users register through your storefront registration form.
            </p>
          </Banner>
        </Layout.Section>
      </Layout>
    </Page>
  );
}

export default User;
