import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ApiKeyModal = ({ isOpen, onClose, onConfirm, currentApiKey = '', allowClose = true }) => {
  const [apiKey, setApiKey] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [showKey, setShowKey] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setApiKey(currentApiKey);
      setValidationError('');
      setShowKey(false);
    }
  }, [isOpen, currentApiKey]);

  const validateApiKey = async (key) => {
    if (!key || !key.trim()) {
      return { valid: false, error: 'Vui lòng nhập API key' };
    }

    // Basic format validation (Gemini API keys usually start with AIza)
    if (!key.trim().startsWith('AIza')) {
      return { valid: false, error: 'API key không đúng định dạng. Gemini API key thường bắt đầu bằng "AIza"' };
    }

    if (key.trim().length < 30) {
      return { valid: false, error: 'API key quá ngắn. Vui lòng kiểm tra lại.' };
    }

    // Try to validate with a simple API call
    try {
      setIsValidating(true);
      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models?key=' + key.trim(), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        return { valid: true };
      } else if (response.status === 400 || response.status === 403) {
        return { valid: false, error: 'API key không hợp lệ hoặc đã bị vô hiệu hóa' };
      } else {
        // If we can't validate, assume it's valid (might be network issue)
        return { valid: true };
      }
    } catch (error) {
      // Network error - assume key might be valid
      console.warn('Could not validate API key:', error);
      return { valid: true };
    } finally {
      setIsValidating(false);
    }
  };

  const handleConfirm = async () => {
    setValidationError('');
    const validation = await validateApiKey(apiKey);
    
    if (validation.valid) {
      onConfirm(apiKey.trim());
      onClose();
    } else {
      setValidationError(validation.error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !isValidating) {
      handleConfirm();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-900 flex items-center">
              <span className="mr-2">🔑</span>
              Cấu hình API Key
            </h3>
            {allowClose && (
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Gemini API Key
            </label>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => {
                  setApiKey(e.target.value);
                  setValidationError('');
                }}
                onKeyPress={handleKeyPress}
                placeholder="Nhập API key của bạn (bắt đầu bằng AIza...)"
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  validationError ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={isValidating}
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showKey ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            
            {validationError && (
              <p className="mt-2 text-sm text-red-600">{validationError}</p>
            )}
            
            <p className="mt-2 text-xs text-gray-500">
              API key sẽ được lưu cục bộ trên trình duyệt của bạn và chỉ bạn có thể xem.
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
            <p className="text-xs text-blue-800">
              <strong>Làm thế nào để lấy API key?</strong>
              <br />
              1. Truy cập{' '}
              <a
                href="https://makersuite.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-blue-900"
              >
                Google AI Studio
              </a>
              <br />
              2. Đăng nhập và tạo API key mới
              <br />
              3. Sao chép và dán vào đây
            </p>
          </div>

          <div className="flex space-x-3">
            {allowClose && (
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                disabled={isValidating}
              >
                Hủy
              </button>
            )}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleConfirm}
              disabled={isValidating || !apiKey.trim()}
              className={`${allowClose ? 'flex-1' : 'w-full'} px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-medium transition-all ${
                isValidating || !apiKey.trim()
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:from-blue-600 hover:to-blue-700'
              }`}
            >
              {isValidating ? (
                <span className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Đang kiểm tra...
                </span>
              ) : (
                'Xác nhận và Lưu'
              )}
            </motion.button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ApiKeyModal;

