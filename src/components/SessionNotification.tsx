import React, { useEffect, useState } from 'react';

interface SessionNotificationProps {
  show: boolean;
  onClose: () => void;
}

export const SessionNotification: React.FC<SessionNotificationProps> = ({ show, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      // Auto close after 5 seconds
      const timer = setTimeout(() => {
        setIsVisible(false);
        onClose();
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!isVisible) return null;

  return (
    <div className="fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2 animate-slide-in">
      <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.962-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z"></path>
      </svg>
      <span className="font-medium">Session expired. Redirecting to login...</span>
      <button 
        aria-label="Close"
        onClick={() => {
          setIsVisible(false);
          onClose();
        }}
        className="ml-2 text-white hover:text-gray-200 flex-shrink-0"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      </button>
    </div>
  );
};

// Context for managing session notifications
interface SessionNotificationContextType {
  showSessionExpired: () => void;
}

const SessionNotificationContext = React.createContext<SessionNotificationContextType | undefined>(undefined);

export const useSessionNotification = () => {
  const context = React.useContext(SessionNotificationContext);
  if (!context) {
    throw new Error('useSessionNotification must be used within a SessionNotificationProvider');
  }
  return context;
};

interface SessionNotificationProviderProps {
  children: React.ReactNode;
}

export const SessionNotificationProvider: React.FC<SessionNotificationProviderProps> = ({ children }) => {
  const [showNotification, setShowNotification] = useState(false);

  const showSessionExpired = () => {
    setShowNotification(true);
  };

  const handleClose = () => {
    setShowNotification(false);
  };

  return (
    <SessionNotificationContext.Provider value={{ showSessionExpired }}>
      {children}
      <SessionNotification show={showNotification} onClose={handleClose} />
    </SessionNotificationContext.Provider>
  );
};