"use client";

import { useState, useEffect } from "react"; // ← Add useEffect
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import { Search, Mail, User, Calendar, MessageSquare, X } from "lucide-react";
import { useGetAllContactsQuery } from '@/store/features/contactApi';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation'; // ← Add this

export default function AdminContactManagement() {
  const router = useRouter();
  const { data: contacts, isLoading, error } = useGetAllContactsQuery();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedContact, setSelectedContact] = useState(null);
  const [filter, setFilter] = useState("all");

  // Frontend protection: Redirect if no token
  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      router.push('/admin/login'); // or wherever your admin login is
    }
  }, [router]);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-100, 100], [30, -30]);
  const rotateY = useTransform(x, [-100, 100], [-30, 30]);

  const filteredContacts = contacts?.filter(contact => {
    const matchesSearch = 
      contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.message.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filter === "all" || 
      (filter === "recent" && new Date(contact.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
    
    return matchesSearch && matchesFilter;
  }) || [];

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.8, rotateY: 90 },
    visible: (i) => ({
      opacity: 1,
      scale: 1,
      rotateY: 0,
      transition: { 
        delay: i * 0.1,
        duration: 0.5,
        type: "spring",
        stiffness: 100
      }
    }),
    hover: { 
      scale: 1.05,
      boxShadow: "0px 10px 30px rgba(0,0,0,0.2)",
      transition: { duration: 0.3 }
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.5, rotateX: -90 },
    visible: { 
      opacity: 1, 
      scale: 1, 
      rotateX: 0,
      transition: { duration: 0.5, type: "spring" }
    },
    exit: { opacity: 0, scale: 0.5, rotateX: 90, transition: { duration: 0.3 } }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 to-purple-900 flex items-center justify-center">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-white border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (error) {
    let errorMessage = "Error loading contacts";
    if (error.status === 403) {
      errorMessage = "Access forbidden: You do not have admin permissions. Please log out and log in again as an administrator.";
    } else if (error.data?.message) {
      errorMessage = error.data.message;
    } else if (error.message) {
      errorMessage += `: ${error.message}`;
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 to-purple-900 flex flex-col items-center justify-center text-white text-center px-6 gap-4">
        <h2 className="text-2xl sm:text-3xl font-bold">{errorMessage}</h2>
        <button 
          onClick={() => {
            localStorage.removeItem('token');
            router.push('/admin/login');
          }}
          className="px-6 py-3 bg-white/20 backdrop-blur rounded-full hover:bg-white/30 transition"
        >
          Log Out & Try Again
        </button>
      </div>
    );
  }

  // Rest of your component (unchanged)
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 to-purple-900 p-4 sm:p-8 overflow-hidden">
      <motion.div 
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto"
      >
        <h1 className="text-3xl sm:text-5xl font-bold text-white mb-8 sm:mb-12 text-center tracking-wide">
          Contact Management Dashboard
        </h1>
        
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by name, email, or subject..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 sm:py-4 bg-white/10 backdrop-blur-md rounded-full text-white placeholder-gray-400 border border-white/20 focus:outline-none focus:border-white/40 transition-all"
            />
          </div>
          
          <select 
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-6 py-3 sm:py-4 bg-white/10 backdrop-blur-md rounded-full text-white border border-white/20 focus:outline-none focus:border-white/40 transition-all cursor-pointer"
          >
            <option value="all">All Contacts</option>
            <option value="recent">Recent (Last 7 Days)</option>
          </select>
        </div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          {filteredContacts.map((contact, index) => (
            <motion.div
              key={contact._id}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              whileHover="hover"
              custom={index}
              onClick={() => setSelectedContact(contact)}
              style={{ perspective: 2000 }}
              className="relative cursor-pointer"
            >
              <motion.div
                style={{ rotateX, rotateY }}
                onMouseMove={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  x.set(e.clientX - rect.left - rect.width / 2);
                  y.set(e.clientY - rect.top - rect.height / 2);
                }}
                onMouseLeave={() => {
                  x.set(0);
                  y.set(0);
                }}
                className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10 hover:border-white/30 transition-all h-full overflow-hidden relative"
              >
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-transparent to-white/5 pointer-events-none"></div>
                
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-blue-300" />
                  </div>
                  <h3 className="text-white font-semibold truncate">{contact.name}</h3>
                </div>
                
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2 text-blue-200">
                    <Mail className="w-4 h-4" />
                    <span className="truncate">{contact.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-purple-200">
                    <MessageSquare className="w-4 h-4" />
                    <span className="truncate">{contact.subject}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-300">
                    <Calendar className="w-4 h-4" />
                    <span>{format(new Date(contact.createdAt), 'MMM dd, yyyy HH:mm')}</span>
                  </div>
                </div>
                
                <p className="mt-4 text-gray-300 line-clamp-3 text-sm">{contact.message}</p>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>

        {filteredContacts.length === 0 && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16 text-white/70 text-xl"
          >
            No contacts found matching your criteria.
          </motion.div>
        )}
      </motion.div>

      <AnimatePresence>
        {selectedContact && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedContact(null)}
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          >
            <motion.div 
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={(e) => e.stopPropagation()}
              className="bg-gradient-to-br from-gray-800 to-indigo-900 rounded-3xl p-6 sm:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto relative shadow-2xl border border-white/10"
            >
              <button 
                onClick={() => setSelectedContact(null)}
                className="absolute top-4 right-4 text-white/70 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
              
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6 text-center">Contact Details</h2>
              
              <div className="space-y-6 text-white">
                <div className="bg-white/5 rounded-xl p-4 sm:p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <User className="w-5 h-5 text-blue-300" />
                    <span className="font-semibold">Name:</span> {selectedContact.name}
                  </div>
                  <div className="flex items-center gap-3 mb-4">
                    <Mail className="w-5 h-5 text-blue-300" />
                    <span className="font-semibold">Email:</span> {selectedContact.email}
                  </div>
                  <div className="flex items-center gap-3 mb-4">
                    <MessageSquare className="w-5 h-5 text-purple-300" />
                    <span className="font-semibold">Subject:</span> {selectedContact.subject}
                  </div>
                  <div className="flex items-center gap-3 mb-4">
                    <Calendar className="w-5 h-5 text-gray-300" />
                    <span className="font-semibold">Date:</span> {format(new Date(selectedContact.createdAt), 'MMMM dd, yyyy HH:mm')}
                  </div>
                </div>
                
                <div className="bg-white/5 rounded-xl p-4 sm:p-6">
                  <h3 className="font-semibold mb-3 text-lg">Message:</h3>
                  <p className="text-gray-200 leading-relaxed">{selectedContact.message}</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}