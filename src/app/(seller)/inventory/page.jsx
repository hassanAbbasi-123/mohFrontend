"use client";
import { useState } from "react";
import {
  useGetMyInventoryQuery,
  useUpdateQuantityMutation,
  useAddStockMutation,
  useRemoveStockMutation,
  useToggleStockMutation,
  useGetStockHistoryQuery,
} from "@/store/features/inventoryApi";

export default function SellerInventory() {
  const { data, isLoading, error } = useGetMyInventoryQuery();
  const [updateQuantity] = useUpdateQuantityMutation();
  const [addStock] = useAddStockMutation();
  const [removeStock] = useRemoveStockMutation();
  const [toggleStock] = useToggleStockMutation();
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const handleAction = async (loadingKey, actionFunc, params) => {
    setActionLoading(loadingKey);
    try {
      await actionFunc(params);
    } catch (error) {
      console.error("Action failed:", error);
    }
    setActionLoading(null);
  };

  // Pagination calculations
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = data?.products?.slice(indexOfFirstItem, indexOfLastItem) || [];
  const totalPages = Math.ceil((data?.products?.length || 0) / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (isLoading) return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
        <div style={{ animation: "spin 1s linear infinite", width: "48px", height: "48px", border: "3px solid rgba(255,255,255,0.3)", borderTop: "3px solid white", borderRadius: "50%" }}></div>
        <p style={{ color: "white", fontSize: "18px", fontWeight: "500" }}>Loading your inventory...</p>
      </div>
    </div>
  );
  
  if (error) return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "white", padding: "48px", borderRadius: "24px", boxShadow: "0 20px 40px rgba(0,0,0,0.1)", textAlign: "center", maxWidth: "480px", width: "90%" }}>
        <div style={{ fontSize: "64px", marginBottom: "24px" }}>⚠️</div>
        <h2 style={{ fontSize: "24px", fontWeight: "600", color: "#1a202c", marginBottom: "12px" }}>Error Loading Inventory</h2>
        <p style={{ color: "#718096", fontSize: "16px" }}>Please try refreshing the page or contact support if the problem persists</p>
        <button 
          onClick={() => window.location.reload()}
          style={{ marginTop: "24px", padding: "12px 24px", background: "linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)", color: "white", border: "none", borderRadius: "12px", fontWeight: "600", cursor: "pointer" }}
        >
          Refresh Page
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)", padding: "24px" }}>
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
        {/* Header Section */}
        <div style={{ marginBottom: "32px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "32px", flexWrap: "wrap", gap: "24px" }}>
            <div style={{ flex: "1", minWidth: "300px" }}>
              <h1 style={{ fontSize: "42px", marginLeft: "20px", fontWeight: "700", background: "linear-gradient(135deg, #2d3748 0%, #4a5568 100%)", backgroundClip: "text", WebkitBackgroundClip: "text", color: "transparent", marginBottom: "8px" }}>Inventory Management</h1>
              <p style={{ color: "#718096", fontSize: "18px",marginLeft: "20px", maxWidth: "500px" }}>Manage your product stock with precision and track inventory changes in real-time</p>
            </div>
            <div style={{ background: "white", padding: "24px", borderRadius: "20px", boxShadow: "0 10px 30px rgba(0,0,0,0.08)", border: "1px solid rgba(255,255,255,0.2)", backdropFilter: "blur(10px)" }}>
              <div style={{ display: "flex", gap: "32px" }}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "32px", fontWeight: "700", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", backgroundClip: "text", WebkitBackgroundClip: "text", color: "transparent" }}>{data?.totalProducts || 0}</div>
                  <div style={{ fontSize: "14px", color: "#718096", fontWeight: "500" }}>Total Products</div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "32px", fontWeight: "700", background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)", backgroundClip: "text", WebkitBackgroundClip: "text", color: "transparent" }}>{data?.lowStockCount || 0}</div>
                  <div style={{ fontSize: "14px", color: "#718096", fontWeight: "500" }}>Low Stock</div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats Cards */}
          <div style={{ display: "grid",marginLeft: "16px", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "px", marginBottom: "32px" }}>
            <div style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", color: "white", padding: "32px", borderRadius: "20px", boxShadow: "0 15px 35px rgba(102, 126, 234, 0.3)", position: "relative", overflow: "hidden" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", position: "relative", zIndex: "2" }}>
                <div>
                  <p style={{ color: "rgba(255,255,255,0.9)", fontSize: "14px", fontWeight: "500", marginBottom: "8px" }}>Active Products</p>
                  <p style={{ fontSize: "36px", fontWeight: "700" }}>
                    {data?.products?.filter(p => p.inStock).length || 0}
                  </p>
                </div>
                <div style={{ fontSize: "48px", opacity: "0.8" }}>🔄</div>
              </div>
              <div style={{ position: "absolute", top: "-20px", right: "-20px", width: "100px", height: "100px", background: "rgba(255,255,255,0.1)", borderRadius: "50%" }}></div>
            </div>
            
            <div style={{ background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)", color: "white", padding: "32px", borderRadius: "20px", boxShadow: "0 15px 35px rgba(79, 172, 254, 0.3)", position: "relative", overflow: "hidden" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", position: "relative", zIndex: "2" }}>
                <div>
                  <p style={{ color: "rgba(255,255,255,0.9)", fontSize: "14px", fontWeight: "500", marginBottom: "8px" }}>Total Quantity</p>
                  <p style={{ fontSize: "36px", fontWeight: "700" }}>
                    {data?.products?.reduce((sum, p) => sum + p.quantity, 0) || 0}
                  </p>
                </div>
                <div style={{ fontSize: "48px", opacity: "0.8" }}>📊</div>
              </div>
              <div style={{ position: "absolute", top: "-20px", right: "-20px", width: "100px", height: "100px", background: "rgba(255,255,255,0.1)", borderRadius: "50%" }}></div>
            </div>
            
            <div style={{ background: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)", color: "#2d3748", padding: "32px", borderRadius: "20px", boxShadow: "0 15px 35px rgba(168, 237, 234, 0.3)", position: "relative", overflow: "hidden" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", position: "relative", zIndex: "2" }}>
                <div>
                  <p style={{ color: "rgba(45,55,72,0.8)", fontSize: "14px", fontWeight: "500", marginBottom: "8px" }}>Categories</p>
                  <p style={{ fontSize: "36px", fontWeight: "700" }}>
                    {new Set(data?.products?.map(p => p.category?.name).filter(Boolean)).size || 0}
                  </p>
                </div>
                <div style={{ fontSize: "48px", opacity: "0.8" }}>🏷️</div>
              </div>
              <div style={{ position: "absolute", top: "-20px", right: "-20px", width: "100px", height: "100px", background: "rgba(255,255,255,0.3)", borderRadius: "50%" }}></div>
            </div>
          </div>
        </div>

        {/* Products Table */}
        <div style={{ background: "white",marginLeft: "18px", borderRadius: "20px", boxShadow: "0 10px 30px rgba(0,0,0,0.08)", border: "1px solid rgba(255,255,255,0.2)", overflow: "hidden" }}>
          <div style={{ padding: "24px", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
            <h2 style={{ fontSize: "24px", fontWeight: "600", color: "#2d3748" }}>Product Inventory</h2>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "14px", color: "#718096" }}>
              <span>Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, data?.products?.length || 0)} of {data?.products?.length || 0} products</span>
            </div>
          </div>
          
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead style={{ background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)" }}>
                <tr>
                  <th style={{ padding: "20px 24px", textAlign: "left", fontSize: "12px", fontWeight: "600", color: "#718096", textTransform: "uppercase", letterSpacing: "0.05em" }}>Product</th>
                  <th style={{ padding: "20px 24px", textAlign: "left", fontSize: "12px", fontWeight: "600", color: "#718096", textTransform: "uppercase", letterSpacing: "0.05em" }}>Category</th>
                  <th style={{ padding: "20px 24px", textAlign: "left", fontSize: "12px", fontWeight: "600", color: "#718096", textTransform: "uppercase", letterSpacing: "0.05em" }}>Brand</th>
                  <th style={{ padding: "20px 24px", textAlign: "left", fontSize: "12px", fontWeight: "600", color: "#718096", textTransform: "uppercase", letterSpacing: "0.05em" }}>Quantity</th>
                  <th style={{ padding: "20px 24px", textAlign: "left", fontSize: "12px", fontWeight: "600", color: "#718096", textTransform: "uppercase", letterSpacing: "0.05em" }}>Status</th>
                  <th style={{ padding: "20px 24px", textAlign: "left", fontSize: "12px", fontWeight: "600", color: "#718096", textTransform: "uppercase", letterSpacing: "0.05em" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((p) => (
                  <tr key={p._id} style={{ borderBottom: "1px solid #f1f5f9", transition: "all 0.2s ease" }}>
                    <td style={{ padding: "24px" }}>
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <div style={{ flexShrink: "0", width: "48px", height: "48px", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: "600", fontSize: "18px" }}>
                          {p.name?.charAt(0)}
                        </div>
                        <div style={{ marginLeft: "16px" }}>
                          <div style={{ fontSize: "16px", fontWeight: "600", color: "#2d3748" }}>{p.name}</div>
                          <div style={{ fontSize: "14px", color: "#718096", marginTop: "4px" }}>SKU: {p.sku || "N/A"}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "24px" }}>
                      <span style={{ display: "inline-flex", alignItems: "center", padding: "6px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "500", background: "rgba(102, 126, 234, 0.1)", color: "#667eea" }}>
                        {p.category?.name || "Uncategorized"}
                      </span>
                    </td>
                    <td style={{ padding: "24px", fontSize: "14px", color: "#4a5568", fontWeight: "500" }}>
                      {p.brand?.name || "No Brand"}
                    </td>
                    <td style={{ padding: "24px" }}>
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <span style={{ 
                          fontSize: "18px", 
                          fontWeight: "700", 
                          color: p.quantity === 0 ? '#e53e3e' : p.quantity < 10 ? '#dd6b20' : '#38a169'
                        }}>
                          {p.quantity}
                        </span>
                        {p.quantity < 10 && p.quantity > 0 && (
                          <span style={{ marginLeft: "8px", padding: "4px 10px", fontSize: "11px", fontWeight: "600", background: "#fed7d7", color: "#c53030", borderRadius: "12px" }}>
                            Low Stock
                          </span>
                        )}
                        {p.quantity === 0 && (
                          <span style={{ marginLeft: "8px", padding: "4px 10px", fontSize: "11px", fontWeight: "600", background: "#fed7d7", color: "#c53030", borderRadius: "12px" }}>
                            Out of Stock
                          </span>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: "24px" }}>
                      <span style={{ display: "inline-flex", alignItems: "center", padding: "8px 16px", borderRadius: "20px", fontSize: "12px", fontWeight: "600", 
                        background: p.inStock ? 'rgba(72, 187, 120, 0.1)' : 'rgba(245, 101, 101, 0.1)',
                        color: p.inStock ? '#38a169' : '#e53e3e'
                      }}>
                        <span style={{ 
                          width: "8px", 
                          height: "8px", 
                          borderRadius: "50%", 
                          background: p.inStock ? '#38a169' : '#e53e3e',
                          marginRight: "8px"
                        }}></span>
                        {p.inStock ? "In Stock" : "Out of Stock"}
                      </span>
                    </td>
                    <td style={{ padding: "24px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                        <button
                          onClick={() => handleAction(`update-${p._id}`, updateQuantity, { 
                            id: p._id, 
                            data: { quantity: p.quantity + 5, reason: "Manual adjustment" } 
                          })}
                          disabled={actionLoading === `update-${p._id}`}
                          style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "40px", height: "40px", border: "none", borderRadius: "12px", fontSize: "14px", fontWeight: "600", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", color: "white", cursor: "pointer", transition: "all 0.2s ease", opacity: actionLoading === `update-${p._id}` ? 0.6 : 1 }}
                        >
                          {actionLoading === `update-${p._id}` ? '⋯' : '+5'}
                        </button>
                        
                        <button
                          onClick={() => handleAction(`add-${p._id}`, addStock, { 
                            id: p._id, 
                            data: { amount: 10, reason: "Restock" } 
                          })}
                          disabled={actionLoading === `add-${p._id}`}
                          style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "40px", height: "40px", border: "none", borderRadius: "12px", fontSize: "14px", fontWeight: "600", background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)", color: "white", cursor: "pointer", transition: "all 0.2s ease", opacity: actionLoading === `add-${p._id}` ? 0.6 : 1 }}
                        >
                          {actionLoading === `add-${p._id}` ? '⋯' : '+10'}
                        </button>
                        
                        <button
                          onClick={() => handleAction(`remove-${p._id}`, removeStock, { 
                            id: p._id, 
                            data: { amount: 5, reason: "Adjustment" } 
                          })}
                          disabled={actionLoading === `remove-${p._id}`}
                          style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "40px", height: "40px", border: "none", borderRadius: "12px", fontSize: "14px", fontWeight: "600", background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)", color: "white", cursor: "pointer", transition: "all 0.2s ease", opacity: actionLoading === `remove-${p._id}` ? 0.6 : 1 }}
                        >
                          {actionLoading === `remove-${p._id}` ? '⋯' : '-5'}
                        </button>
                        
                        <button
                          onClick={() => handleAction(`toggle-${p._id}`, toggleStock, {id: p._id})}
                          disabled={actionLoading === `toggle-${p._id}`}
                          style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", padding: "10px 16px", border: "1px solid #e2e8f0", borderRadius: "12px", fontSize: "12px", fontWeight: "600", background: "white", color: "#4a5568", cursor: "pointer", transition: "all 0.2s ease", opacity: actionLoading === `toggle-${p._id}` ? 0.6 : 1 }}
                        >
                          {actionLoading === `toggle-${p._id}` ? '⋯' : 'Toggle'}
                        </button>
                        
                        <button
                          onClick={() => setSelectedProduct(p._id)}
                          style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", padding: "10px 16px", border: "1px solid #e2e8f0", borderRadius: "12px", fontSize: "12px", fontWeight: "600", background: "white", color: "#4a5568", cursor: "pointer", transition: "all 0.2s ease" }}
                        >
                          History
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {(!data?.products || data.products.length === 0) && (
            <div style={{ textAlign: "center", padding: "60px 24px" }}>
              <div style={{ fontSize: "64px", marginBottom: "16px" }}>📦</div>
              <h3 style={{ fontSize: "20px", fontWeight: "600", color: "#2d3748", marginBottom: "8px" }}>No products found</h3>
              <p style={{ color: "#718096" }}>Start by adding products to your inventory</p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ padding: "24px", borderTop: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
              <div style={{ fontSize: "14px", color: "#718096" }}>
                Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, data?.products?.length || 0)} of {data?.products?.length || 0} entries
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  onClick={() => paginate(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  style={{ padding: "8px 16px", border: "1px solid #e2e8f0", borderRadius: "8px", background: "white", color: currentPage === 1 ? "#cbd5e0" : "#4a5568", cursor: currentPage === 1 ? "not-allowed" : "pointer", fontSize: "14px", fontWeight: "500" }}
                >
                  Previous
                </button>
                
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => paginate(pageNum)}
                      style={{ 
                        padding: "8px 16px", 
                        border: "1px solid #e2e8f0", 
                        borderRadius: "8px", 
                        background: currentPage === pageNum ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" : "white", 
                        color: currentPage === pageNum ? "white" : "#4a5568", 
                        cursor: "pointer", 
                        fontSize: "14px", 
                        fontWeight: "500",
                        minWidth: "40px"
                      }}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                
                <button
                  onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  style={{ padding: "8px 16px", border: "1px solid #e2e8f0", borderRadius: "8px", background: "white", color: currentPage === totalPages ? "#cbd5e0" : "#4a5568", cursor: currentPage === totalPages ? "not-allowed" : "pointer", fontSize: "14px", fontWeight: "500" }}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Stock History Modal */}
      {selectedProduct && (
        <StockHistoryModal 
          id={selectedProduct} 
          onClose={() => setSelectedProduct(null)} 
        />
      )}
      
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        tr:hover {
          background-color: #f8fafc;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        }
        
        button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
      `}</style>
    </div>
  );
}

function StockHistoryModal({ id, onClose }) {
  const { data, isLoading } = useGetStockHistoryQuery(id);

  // Fix for date display - ensure we're properly formatting the date
  const formatDate = (timestamp) => {
    if (!timestamp) return "Unknown date";
    
    // Handle both string and object timestamps
    const date = typeof timestamp === 'string' || typeof timestamp === 'number' 
      ? new Date(timestamp) 
      : timestamp;
    
    if (isNaN(date.getTime())) return "Invalid date";
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div style={{ position: "fixed", top: "0", left: "0", right: "0", bottom: "0", background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px", zIndex: "50" }}>
      <div style={{ background: "white", borderRadius: "24px", boxShadow: "0 25px 50px rgba(0,0,0,0.25)", width: "100%", maxWidth: "800px", maxHeight: "90vh", overflow: "hidden", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "24px", borderBottom: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "between" }}>
          <h3 style={{ fontSize: "24px", fontWeight: "600", color: "#2d3748" }}>Stock History</h3>
          <button
            onClick={onClose}
            style={{ marginLeft: "auto", background: "none", border: "none", fontSize: "24px", color: "#a0aec0", cursor: "pointer", padding: "8px", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            ×
          </button>
        </div>
        
        <div style={{ padding: "24px", overflowY: "auto", flex: "1" }}>
          {isLoading ? (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: "40px" }}>
              <div style={{ animation: "spin 1s linear infinite", width: "32px", height: "32px", border: "3px solid #e2e8f0", borderTop: "3px solid #667eea", borderRadius: "50%" }}></div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {data?.history?.map((h, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px", background: "#f8fafc", borderRadius: "16px", border: "1px solid #e2e8f0", transition: "all 0.2s ease" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                    <div style={{ 
                      flexShrink: "0", 
                      width: "48px", 
                      height: "48px", 
                      borderRadius: "12px", 
                      display: "flex", 
                      alignItems: "center", 
                      justifyContent: "center",
                      background: h.change > 0 ? "linear-gradient(135deg, #48bb78 0%, #38a169 100%)" : "linear-gradient(135deg, #f56565 0%, #e53e3e 100%)",
                      color: "white",
                      fontWeight: "600",
                      fontSize: "16px"
                    }}>
                      {h.change > 0 ? '+' : ''}{h.change}
                    </div>
                    <div>
                      <p style={{ fontWeight: "600", color: "#2d3748", marginBottom: "4px" }}>{h.reason || "Stock adjustment"}</p>
                      <p style={{ fontSize: "14px", color: "#718096" }}>By: {h.updatedBy || "System"}</p>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p style={{ fontWeight: "500", color: "#2d3748" }}>
                      {formatDate(h.timestamp)}
                    </p>
                    <p style={{ fontSize: "12px", color: "#a0aec0", marginTop: "4px" }}>
                      Previous: {h.previousQuantity || 0} → New: {(h.previousQuantity || 0) + (h.change || 0)}
                    </p>
                  </div>
                </div>
              ))}
              
              {(!data?.history || data.history.length === 0) && (
                <div style={{ textAlign: "center", padding: "40px 24px" }}>
                  <div style={{ fontSize: "48px", marginBottom: "16px" }}>📊</div>
                  <p style={{ color: "#718096", fontSize: "16px" }}>No stock history available for this product</p>
                </div>
              )}
            </div>
          )}
        </div>
        
        <div style={{ padding: "24px", borderTop: "1px solid #e2e8f0", background: "#f8fafc" }}>
          <button
            onClick={onClose}
            style={{ width: "100%", padding: "12px 24px", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", color: "white", border: "none", borderRadius: "12px", fontWeight: "600", cursor: "pointer", fontSize: "16px", transition: "all 0.2s ease" }}
          >
            Close History
          </button>
        </div>
      </div>
    </div>
  );
}