"use client";
import { useState } from "react";
import {
  useGetAllInventoryQuery,
  useGetSellerInventoryQuery,
} from "@/store/features/inventoryApi";

export default function AdminInventory() {
  const { data, isLoading, error } = useGetAllInventoryQuery();
  const [storeName, setStoreName] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sellerCurrentPage, setSellerCurrentPage] = useState(1);
  const [sellerItemsPerPage, setSellerItemsPerPage] = useState(10);

  // ✅ FIX: Always call the hook unconditionally, use skip option for conditional fetching
  const { data: sellerData } = useGetSellerInventoryQuery(storeName, {
    skip: !storeName,
  });

  if (isLoading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
      <div style={{ 
        padding: '2rem', 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
        color: 'white', 
        borderRadius: '12px',
        fontWeight: '500',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
      }}>
        Loading Inventory Data...
      </div>
    </div>
  );
  
  if (error) return (
    <div style={{ padding: '1.5rem', margin: '1rem', background: '#fee2e2', border: '1px solid #fecaca', borderRadius: '8px', color: '#dc2626' }}>
      Error loading inventory data. Please try again later.
    </div>
  );

  // ✅ Filter products by storeName (case-insensitive)
  const filteredProducts = storeName
    ? data?.products?.filter((p) =>
        p.seller?.storeName?.toLowerCase().includes(storeName.toLowerCase())
      ) || []
    : [];

  // Pagination calculations for main products table
  const allProducts = data?.products || [];
  const totalPages = Math.ceil(allProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProducts = allProducts.slice(startIndex, endIndex);

  // Pagination calculations for filtered seller products
  const sellerTotalPages = Math.ceil(filteredProducts.length / sellerItemsPerPage);
  const sellerStartIndex = (sellerCurrentPage - 1) * sellerItemsPerPage;
  const sellerEndIndex = sellerStartIndex + sellerItemsPerPage;
  const currentSellerProducts = filteredProducts.slice(sellerStartIndex, sellerEndIndex);

  // Reset to first page when items per page changes
  const handleItemsPerPageChange = (value) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1);
  };

  const handleSellerItemsPerPageChange = (value) => {
    setSellerItemsPerPage(Number(value));
    setSellerCurrentPage(1);
  };

  // Generate page numbers for pagination
  const getPageNumbers = (totalPages, currentPage) => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Header Section */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '700', color: '#1f2937', marginBottom: '0.5rem' }}>
          Inventory Management
        </h1>
        <p style={{ color: '#6b7280', fontSize: '1.1rem' }}>
          Comprehensive overview of all products and seller inventories
        </p>
      </div>

      {/* Stats Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
        gap: '1.5rem', 
        marginBottom: '2rem' 
      }}>
        <div style={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
          color: 'white', 
          padding: '1.5rem', 
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ fontSize: '0.875rem', opacity: '0.9', marginBottom: '0.5rem' }}>Total Products</div>
          <div style={{ fontSize: '2rem', fontWeight: '700' }}>{data?.totalProducts}</div>
        </div>
        
        <div style={{ 
          background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', 
          color: 'white', 
          padding: '1.5rem', 
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ fontSize: '0.875rem', opacity: '0.9', marginBottom: '0.5rem' }}>Total Stock Value</div>
          <div style={{ fontSize: '2rem', fontWeight: '700' }}>${data?.totalStockValue}</div>
        </div>
        
        <div style={{ 
          background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', 
          color: 'white', 
          padding: '1.5rem', 
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ fontSize: '0.875rem', opacity: '0.9', marginBottom: '0.5rem' }}>Low Stock Items</div>
          <div style={{ fontSize: '2rem', fontWeight: '700' }}>{data?.lowStockCount}</div>
        </div>
        
        <div style={{ 
          background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', 
          color: 'white', 
          padding: '1.5rem', 
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ fontSize: '0.875rem', opacity: '0.9', marginBottom: '0.5rem' }}>Out of Stock</div>
          <div style={{ fontSize: '2rem', fontWeight: '700' }}>{data?.outOfStockCount}</div>
        </div>
      </div>

      {/* All Products Table */}
      <div style={{ 
        background: 'white', 
        borderRadius: '12px', 
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)', 
        marginBottom: '2rem',
        overflow: 'hidden'
      }}>
        <div style={{ 
          padding: '1.5rem', 
          borderBottom: '1px solid #e5e7eb',
          background: '#f8fafc',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1f2937' }}>
            All Products
          </h3>
          
          {/* Items per page selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>Show:</span>
            <select 
              value={itemsPerPage}
              onChange={(e) => handleItemsPerPageChange(e.target.value)}
              style={{
                padding: '0.5rem',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '0.875rem',
                outline: 'none',
                background: 'white'
              }}
            >
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="30">30</option>
              <option value="50">50</option>
            </select>
            <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
              {startIndex + 1}-{Math.min(endIndex, allProducts.length)} of {allProducts.length} products
            </span>
          </div>
        </div>
        
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f3f4f6' }}>
                <th style={{ 
                  padding: '1rem', 
                  textAlign: 'left', 
                  fontWeight: '600', 
                  color: '#374151',
                  borderBottom: '1px solid #e5e7eb',
                  fontSize: '0.875rem'
                }}>Product</th>
                <th style={{ 
                  padding: '1rem', 
                  textAlign: 'left', 
                  fontWeight: '600', 
                  color: '#374151',
                  borderBottom: '1px solid #e5e7eb',
                  fontSize: '0.875rem'
                }}>Seller</th>
                <th style={{ 
                  padding: '1rem', 
                  textAlign: 'left', 
                  fontWeight: '600', 
                  color: '#374151',
                  borderBottom: '1px solid #e5e7eb',
                  fontSize: '0.875rem'
                }}>Quantity</th>
                <th style={{ 
                  padding: '1rem', 
                  textAlign: 'left', 
                  fontWeight: '600', 
                  color: '#374151',
                  borderBottom: '1px solid #e5e7eb',
                  fontSize: '0.875rem'
                }}>Category</th>
                <th style={{ 
                  padding: '1rem', 
                  textAlign: 'left', 
                  fontWeight: '600', 
                  color: '#374151',
                  borderBottom: '1px solid #e5e7eb',
                  fontSize: '0.875rem'
                }}>Brand</th>
                <th style={{ 
                  padding: '1rem', 
                  textAlign: 'left', 
                  fontWeight: '600', 
                  color: '#374151',
                  borderBottom: '1px solid #e5e7eb',
                  fontSize: '0.875rem'
                }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {currentProducts.map((p, index) => (
                <tr key={p._id} style={{ 
                  background: index % 2 === 0 ? 'white' : '#fafafa',
                  borderBottom: '1px solid #e5e7eb'
                }}>
                  <td style={{ 
                    padding: '1rem', 
                    color: '#1f2937',
                    fontSize: '0.875rem'
                  }}>{p.name}</td>
                  <td style={{ 
                    padding: '1rem', 
                    color: '#1f2937',
                    fontSize: '0.875rem'
                  }}>{p.seller?.storeName}</td>
                  <td style={{ 
                    padding: '1rem', 
                    color: '#1f2937',
                    fontSize: '0.875rem'
                  }}>{p.quantity}</td>
                  <td style={{ 
                    padding: '1rem', 
                    color: '#1f2937',
                    fontSize: '0.875rem'
                  }}>{p.category?.name}</td>
                  <td style={{ 
                    padding: '1rem', 
                    color: '#1f2937',
                    fontSize: '0.875rem'
                  }}>{p.brand?.name}</td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{
                      padding: '0.25rem 0.75rem',
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      background: p.inStock ? '#d1fae5' : '#fee2e2',
                      color: p.inStock ? '#065f46' : '#991b1b'
                    }}>
                      {p.inStock ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div style={{ 
            padding: '1.5rem', 
            borderTop: '1px solid #e5e7eb',
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
              Page {currentPage} of {totalPages}
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {/* Previous Button */}
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                style={{
                  padding: '0.5rem 1rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  background: 'white',
                  color: currentPage === 1 ? '#9ca3af' : '#374151',
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                  fontSize: '0.875rem',
                  opacity: currentPage === 1 ? 0.5 : 1
                }}
              >
                Previous
              </button>

              {/* Page Numbers */}
              <div style={{ display: 'flex', gap: '0.25rem' }}>
                {getPageNumbers(totalPages, currentPage).map((page, index) => (
                  <button
                    key={index}
                    onClick={() => typeof page === 'number' && setCurrentPage(page)}
                    style={{
                      padding: '0.5rem 0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      background: page === currentPage ? '#3b82f6' : 'white',
                      color: page === currentPage ? 'white' : '#374151',
                      cursor: typeof page === 'number' ? 'pointer' : 'default',
                      fontSize: '0.875rem',
                      minWidth: '2.5rem'
                    }}
                    disabled={typeof page !== 'number'}
                  >
                    {page}
                  </button>
                ))}
              </div>

              {/* Next Button */}
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                style={{
                  padding: '0.5rem 1rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  background: 'white',
                  color: currentPage === totalPages ? '#9ca3af' : '#374151',
                  cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                  fontSize: '0.875rem',
                  opacity: currentPage === totalPages ? 0.5 : 1
                }}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Seller Search Section */}
      <div style={{ 
        background: 'white', 
        borderRadius: '12px', 
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)', 
        overflow: 'hidden'
      }}>
        <div style={{ 
          padding: '1.5rem', 
          borderBottom: '1px solid #e5e7eb',
          background: '#f8fafc'
        }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1f2937', marginBottom: '0.5rem' }}>
            Seller Inventory Search
          </h3>
          <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
            Search for specific seller inventory by store name
          </p>
        </div>
        
        <div style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <input
              type="text"
              value={storeName}
              onChange={(e) => {
                setStoreName(e.target.value);
                setSellerCurrentPage(1); // Reset to first page when search changes
              }}
              placeholder="Enter store name to search..."
              style={{
                flex: '1',
                padding: '0.75rem 1rem',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '0.875rem',
                outline: 'none',
                transition: 'all 0.2s',
                maxWidth: '400px'
              }}
              onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
              onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
            />
            <button style={{
              padding: '0.75rem 1.5rem',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '600',
              cursor: 'pointer',
              fontSize: '0.875rem'
            }}>
              Search Seller
            </button>
          </div>

          {filteredProducts.length > 0 && (
            <div style={{ 
              background: '#f0f9ff', 
              borderRadius: '8px', 
              padding: '1.5rem',
              border: '1px solid #e0f2fe'
            }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '1rem',
                marginBottom: '1rem' 
              }}>
                <div>
                  <h4 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#0369a1', marginBottom: '0.25rem' }}>
                    Seller: {filteredProducts[0].seller?.storeName}
                  </h4>
                  <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                    Email: {filteredProducts[0].seller?.user?.email}
                  </p>
                </div>
                
                {/* Seller items per page selector */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.875rem', color: '#0369a1' }}>Show:</span>
                  <select 
                    value={sellerItemsPerPage}
                    onChange={(e) => handleSellerItemsPerPageChange(e.target.value)}
                    style={{
                      padding: '0.5rem',
                      border: '1px solid #bae6fd',
                      borderRadius: '6px',
                      fontSize: '0.875rem',
                      outline: 'none',
                      background: 'white'
                    }}
                  >
                    <option value="10">10</option>
                    <option value="20">20</option>
                    <option value="30">30</option>
                    <option value="50">50</option>
                  </select>
                  <span style={{ fontSize: '0.875rem', color: '#0369a1' }}>
                    {sellerStartIndex + 1}-{Math.min(sellerEndIndex, filteredProducts.length)} of {filteredProducts.length} products
                  </span>
                </div>
              </div>
              
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#e0f2fe' }}>
                      <th style={{ 
                        padding: '0.75rem', 
                        textAlign: 'left', 
                        fontWeight: '600', 
                        color: '#0369a1',
                        borderBottom: '1px solid #bae6fd',
                        fontSize: '0.875rem'
                      }}>Product</th>
                      <th style={{ 
                        padding: '0.75rem', 
                        textAlign: 'left', 
                        fontWeight: '600', 
                        color: '#0369a1',
                        borderBottom: '1px solid #bae6fd',
                        fontSize: '0.875rem'
                      }}>Quantity</th>
                      <th style={{ 
                        padding: '0.75rem', 
                        textAlign: 'left', 
                        fontWeight: '600', 
                        color: '#0369a1',
                        borderBottom: '1px solid #bae6fd',
                        fontSize: '0.875rem'
                      }}>Category</th>
                      <th style={{ 
                        padding: '0.75rem', 
                        textAlign: 'left', 
                        fontWeight: '600', 
                        color: '#0369a1',
                        borderBottom: '1px solid #bae6fd',
                        fontSize: '0.875rem'
                      }}>Brand</th>
                      <th style={{ 
                        padding: '0.75rem', 
                        textAlign: 'left', 
                        fontWeight: '600', 
                        color: '#0369a1',
                        borderBottom: '1px solid #bae6fd',
                        fontSize: '0.875rem'
                      }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentSellerProducts.map((p, index) => (
                      <tr key={p._id} style={{ 
                        background: index % 2 === 0 ? 'white' : '#f0f9ff',
                        borderBottom: '1px solid #e0f2fe'
                      }}>
                        <td style={{ 
                          padding: '0.75rem', 
                          color: '#1f2937',
                          fontSize: '0.875rem'
                        }}>{p.name}</td>
                        <td style={{ 
                          padding: '0.75rem', 
                          color: '#1f2937',
                          fontSize: '0.875rem'
                        }}>{p.quantity}</td>
                        <td style={{ 
                          padding: '0.75rem', 
                          color: '#1f2937',
                          fontSize: '0.875rem'
                        }}>{p.category?.name}</td>
                        <td style={{ 
                          padding: '0.75rem', 
                          color: '#1f2937',
                          fontSize: '0.875rem'
                        }}>{p.brand?.name}</td>
                        <td style={{ padding: '0.75rem' }}>
                          <span style={{
                            padding: '0.25rem 0.75rem',
                            borderRadius: '9999px',
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            background: p.inStock ? '#d1fae5' : '#fee2e2',
                            color: p.inStock ? '#065f46' : '#991b1b'
                          }}>
                            {p.inStock ? 'In Stock' : 'Out of Stock'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Seller Pagination Controls */}
              {sellerTotalPages > 1 && (
                <div style={{ 
                  padding: '1.5rem 0 0 0', 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '1rem'
                }}>
                  <div style={{ fontSize: '0.875rem', color: '#0369a1' }}>
                    Page {sellerCurrentPage} of {sellerTotalPages}
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {/* Previous Button */}
                    <button
                      onClick={() => setSellerCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={sellerCurrentPage === 1}
                      style={{
                        padding: '0.5rem 1rem',
                        border: '1px solid #bae6fd',
                        borderRadius: '6px',
                        background: 'white',
                        color: sellerCurrentPage === 1 ? '#9ca3af' : '#0369a1',
                        cursor: sellerCurrentPage === 1 ? 'not-allowed' : 'pointer',
                        fontSize: '0.875rem',
                        opacity: sellerCurrentPage === 1 ? 0.5 : 1
                      }}
                    >
                      Previous
                    </button>

                    {/* Page Numbers */}
                    <div style={{ display: 'flex', gap: '0.25rem' }}>
                      {getPageNumbers(sellerTotalPages, sellerCurrentPage).map((page, index) => (
                        <button
                          key={index}
                          onClick={() => typeof page === 'number' && setSellerCurrentPage(page)}
                          style={{
                            padding: '0.5rem 0.75rem',
                            border: '1px solid #bae6fd',
                            borderRadius: '6px',
                            background: page === sellerCurrentPage ? '#0369a1' : 'white',
                            color: page === sellerCurrentPage ? 'white' : '#0369a1',
                            cursor: typeof page === 'number' ? 'pointer' : 'default',
                            fontSize: '0.875rem',
                            minWidth: '2.5rem'
                          }}
                          disabled={typeof page !== 'number'}
                        >
                          {page}
                        </button>
                      ))}
                    </div>

                    {/* Next Button */}
                    <button
                      onClick={() => setSellerCurrentPage(prev => Math.min(prev + 1, sellerTotalPages))}
                      disabled={sellerCurrentPage === sellerTotalPages}
                      style={{
                        padding: '0.5rem 1rem',
                        border: '1px solid #bae6fd',
                        borderRadius: '6px',
                        background: 'white',
                        color: sellerCurrentPage === sellerTotalPages ? '#9ca3af' : '#0369a1',
                        cursor: sellerCurrentPage === sellerTotalPages ? 'not-allowed' : 'pointer',
                        fontSize: '0.875rem',
                        opacity: sellerCurrentPage === sellerTotalPages ? 0.5 : 1
                      }}
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {storeName && filteredProducts.length === 0 && (
            <div style={{ 
              padding: '2rem', 
              textAlign: 'center', 
              background: '#fef2f2', 
              borderRadius: '8px',
              border: '1px solid #fecaca'
            }}>
              <div style={{ color: '#dc2626', fontWeight: '600', marginBottom: '0.5rem' }}>
                No products found
              </div>
              <div style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                No inventory found for store name: "{storeName}"
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}