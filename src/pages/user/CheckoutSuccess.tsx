import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, MapPin, Clock, ArrowRight, Sparkles, Package, TruckIcon, ChefHat } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UserOrder } from '@/contexts/UserDataContext';
import { useEffect, useState } from 'react';
import io from 'socket.io-client';
// Removed custom overlay animation

export default function CheckoutSuccess() {
  const navigate = useNavigate();
  const location = useLocation();
  const initialOrder = location.state?.order as UserOrder | undefined;
  const [order, setOrder] = useState<UserOrder | undefined>(initialOrder);
  const [orderStatus, setOrderStatus] = useState<string>(initialOrder?.status || 'placed');

  // Socket connection for real-time updates
  useEffect(() => {
    if (!order?.id) return;

    const token = localStorage.getItem('quickeats_auth');
    if (!token) return;

    const socket = io('http://localhost:5000', {
      auth: { token: JSON.parse(token).token }
    });

    // Join user room
    socket.emit('joinUserRoom', { userId: JSON.parse(token).user?.id });

    // Listen for order status updates
    socket.on('orderStatusUpdate', (data) => {
      if (data.orderId === order.id) {
        console.log('📡 Order status updated:', data.status);
        setOrderStatus(data.status);
        setOrder(prev => prev ? { ...prev, status: data.status } : prev);
      }
    });

    // Listen for delivery boy assignment
    socket.on('deliveryBoyAssigned', (data) => {
      if (data.orderId === order.id) {
        console.log('🚗 Delivery boy assigned');
        setOrderStatus('out_for_delivery');
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [order?.id]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Animated background */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-pink-500/5 to-purple-500/5"
        animate={{
          background: [
            'linear-gradient(to bottom right, rgba(249, 115, 22, 0.05), rgba(236, 72, 153, 0.05), rgba(168, 85, 247, 0.05))',
            'linear-gradient(to bottom right, rgba(236, 72, 153, 0.05), rgba(168, 85, 247, 0.05), rgba(249, 115, 22, 0.05))',
            'linear-gradient(to bottom right, rgba(168, 85, 247, 0.05), rgba(249, 115, 22, 0.05), rgba(236, 72, 153, 0.05))',
          ]
        }}
        transition={{ duration: 5, repeat: Infinity }}
      />

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 100 }}
        className="text-center max-w-lg relative z-10"
      >
        {/* Success icon with animations */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="relative inline-block mb-6"
        >
          {/* Orbiting sparkles */}
          {[0, 1, 2, 3].map((i) => (
            <motion.div
              key={i}
              animate={{ rotate: 360 }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "linear",
                delay: i * 0.25
              }}
              className="absolute inset-0"
            >
              <Sparkles
                className="absolute top-0 left-1/2 w-5 h-5 text-orange-500"
                style={{
                  transform: `translateX(-50%) translateY(-40px) rotate(${i * 90}deg)`
                }}
              />
            </motion.div>
          ))}

          {/* Pulsing background */}
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 0.8, 0.5]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute inset-0 bg-gradient-to-br from-green-400 to-green-600 rounded-full blur-2xl"
          />

          {/* Main icon */}
          <motion.div
            animate={{
              scale: [1, 1.05, 1]
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="relative w-24 h-24 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-2xl"
          >
            <CheckCircle className="w-12 h-12 text-white" strokeWidth={3} />
          </motion.div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent mb-3"
        >
          Order Placed Successfully! 🎉
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-gray-600 mb-8 text-lg"
        >
          Your delicious food is on its way!
        </motion.p>

        {order && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white/80 backdrop-blur-sm border-2 border-orange-100 rounded-2xl p-6 mb-6 text-left shadow-xl"
          >
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
              <span className="text-sm text-gray-600 font-medium">Order ID</span>
              <motion.span
                initial={{ scale: 1.2, color: '#f97316' }}
                animate={{ scale: 1, color: '#111827' }}
                className="font-mono text-sm font-bold"
              >
                #{order.id.slice(-8)}
              </motion.span>
            </div>

            <div className="space-y-4">
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Estimated Delivery</p>
                  <p className="font-semibold text-gray-900">30-45 minutes</p>
                </div>
              </motion.div>

              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="flex items-start gap-3"
              >
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Delivering to</p>
                  <p className="font-medium text-gray-900">{order.deliveryAddress}</p>
                </div>
              </motion.div>
            </div>

            {/* Order progress animation */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="mt-6 pt-6 border-t border-gray-200"
            >
              <div className="flex justify-between items-center">
                {/* Confirmed */}
                <motion.div
                  animate={orderStatus === 'placed' || orderStatus === 'accepted' ? { y: [0, -5, 0] } : {}}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="flex flex-col items-center"
                >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${orderStatus === 'placed' || orderStatus === 'accepted' || orderStatus === 'preparing' || orderStatus === 'out_for_delivery' || orderStatus === 'delivered'
                      ? 'bg-green-100'
                      : 'bg-gray-100'
                    }`}>
                    <Package className={`w-6 h-6 ${orderStatus === 'placed' || orderStatus === 'accepted' || orderStatus === 'preparing' || orderStatus === 'out_for_delivery' || orderStatus === 'delivered'
                        ? 'text-green-600'
                        : 'text-gray-400'
                      }`} />
                  </div>
                  <span className={`text-xs font-medium ${orderStatus === 'placed' || orderStatus === 'accepted'
                      ? 'text-green-600'
                      : 'text-gray-600'
                    }`}>
                    Confirmed
                  </span>
                </motion.div>

                {/* Progress line 1 */}
                <div className="flex-1 h-0.5 bg-gray-200 mx-2 overflow-hidden">
                  <motion.div
                    initial={{ width: '0%' }}
                    animate={{
                      width: orderStatus === 'preparing' || orderStatus === 'out_for_delivery' || orderStatus === 'delivered' ? '100%' : '0%'
                    }}
                    transition={{ duration: 2, ease: "easeInOut" }}
                    className="h-full bg-gradient-to-r from-green-500 to-orange-500"
                  />
                </div>

                {/* Preparing */}
                <motion.div
                  animate={orderStatus === 'preparing' ? { scale: [1, 1.1, 1] } : {}}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="flex flex-col items-center"
                >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${orderStatus === 'preparing' || orderStatus === 'out_for_delivery' || orderStatus === 'delivered'
                      ? 'bg-orange-100'
                      : 'bg-gray-100'
                    }`}>
                    <ChefHat className={`w-6 h-6 ${orderStatus === 'preparing' || orderStatus === 'out_for_delivery' || orderStatus === 'delivered'
                        ? 'text-orange-600'
                        : 'text-gray-400'
                      }`} />
                  </div>
                  <span className={`text-xs font-medium ${orderStatus === 'preparing'
                      ? 'text-orange-600'
                      : orderStatus === 'out_for_delivery' || orderStatus === 'delivered'
                        ? 'text-gray-600'
                        : 'text-gray-400'
                    }`}>
                    Preparing
                  </span>
                </motion.div>

                {/* Progress line 2 */}
                <div className="flex-1 h-0.5 bg-gray-200 mx-2 overflow-hidden">
                  <motion.div
                    initial={{ width: '0%' }}
                    animate={{
                      width: orderStatus === 'out_for_delivery' || orderStatus === 'delivered' ? '100%' : '0%'
                    }}
                    transition={{ duration: 2, ease: "easeInOut" }}
                    className="h-full bg-gradient-to-r from-orange-500 to-blue-500"
                  />
                </div>

                {/* On the way */}
                <motion.div
                  animate={orderStatus === 'out_for_delivery' ? { x: [0, 5, 0] } : {}}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="flex flex-col items-center"
                >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${orderStatus === 'out_for_delivery' || orderStatus === 'delivered'
                      ? 'bg-blue-100'
                      : 'bg-gray-100'
                    }`}>
                    <TruckIcon className={`w-6 h-6 ${orderStatus === 'out_for_delivery' || orderStatus === 'delivered'
                        ? 'text-blue-600'
                        : 'text-gray-400'
                      }`} />
                  </div>
                  <span className={`text-xs font-medium ${orderStatus === 'out_for_delivery'
                      ? 'text-blue-600'
                      : orderStatus === 'delivered'
                        ? 'text-gray-600'
                        : 'text-gray-400'
                    }`}>
                    On the way
                  </span>
                </motion.div>
              </div>

              {/* Status text below timeline */}
              <motion.div
                key={orderStatus}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 text-center"
              >
                <p className="text-sm font-medium text-gray-700">
                  {orderStatus === 'placed' || orderStatus === 'accepted' ? '✅ Order confirmed by restaurant' :
                    orderStatus === 'preparing' ? '👨‍🍳 Your food is being prepared' :
                      orderStatus === 'out_for_delivery' ? '🚗 Delivery partner is on the way' :
                        orderStatus === 'delivered' ? '✅ Order delivered!' :
                          'Processing your order...'}
                </p>
              </motion.div>
            </motion.div>
          </motion.div>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1 }}
            className="flex-1"
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                onClick={() => navigate(order?.id ? `/user/tracking/${order.id}` : '/user/orders')}
                className="w-full gap-2 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 shadow-lg text-lg py-6"
                size="lg"
              >
                Track Your Order
                <motion.div
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  <ArrowRight className="w-5 h-5" />
                </motion.div>
              </Button>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.1 }}
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                variant="outline"
                onClick={() => navigate('/user/dashboard')}
                className="w-full sm:w-auto py-6 border-2"
                size="lg"
              >
                Back to Home
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
