import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Star,
  Clock,
  MapPin,
  Phone,
  Plus,
  Minus,
  ShoppingCart,
  Leaf,
  Utensils,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUserData } from '@/contexts/UserDataContext';
import { useToast } from '@/hooks/use-toast';
import { getRestaurantStatus } from '@/utils/restaurantStatus';
import { cn } from '@/lib/utils';

export default function RestaurantDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { getRestaurantById, addToCart, updateCartQuantity, cart } = useUserData();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Zomato style toggle states
  const [vegMode, setVegMode] = useState(false);
  const [nonVegMode, setNonVegMode] = useState(false);
  const [localMenuItems, setLocalMenuItems] = useState<any[]>([]);
  const [isLoadingMenu, setIsLoadingMenu] = useState(false);

  // Computed Mode
  const dietaryMode = (vegMode && nonVegMode) || (!vegMode && !nonVegMode) ? 'All' : (vegMode ? 'Veg' : 'NonVeg');

  useEffect(() => {
    // Reset category filter if it no longer exists after dietary filter applies
    setSelectedCategory('All');
  }, [dietaryMode]);

  useEffect(() => {
    if (!id) return;
    const fetchMenu = async () => {
      setIsLoadingMenu(true);
      try {
        const query = dietaryMode !== 'All' ? `?dietaryType=${dietaryMode}` : '';
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const res = await fetch(`${API_URL}/api/menu/restaurant/${id}${query}`);
        if (res.ok) {
          const data = await res.json();
          setLocalMenuItems(data);
        }
      } catch (error) {
        console.error("Failed to fetch menu", error);
      } finally {
        setIsLoadingMenu(false);
      }
    };
    fetchMenu();
  }, [id, dietaryMode]);


  const restaurant = getRestaurantById(id || '');

  const status = restaurant ? getRestaurantStatus(
    restaurant.openTime || '',
    restaurant.closeTime || '',
    30,
    undefined,
    restaurant.openingPeriod,
    restaurant.closingPeriod
  ) : 'CLOSED';
  const isOpen = status === 'OPEN' || status === 'CLOSING_SOON';

  if (!restaurant) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-foreground mb-2">Restaurant not found</h2>
          <Button onClick={() => navigate('/user/restaurants')}>Browse Restaurants</Button>
        </div>
      </div>
    );
  }

  const categories = ['All', ...new Set(localMenuItems.map(item => item.category))];
  const filteredItems = selectedCategory === 'All'
    ? localMenuItems
    : localMenuItems.filter(item => item.category === selectedCategory);

  const getCartQuantity = (itemId: string) => {
    const cartItem = cart.find(c => c.menuItemId === itemId);
    return cartItem?.quantity || 0;
  };

  const handleAddToCart = (item: any) => {
    if (!isOpen) {
      toast({
        title: "Restaurant Closed",
        description: "This restaurant is currently closed.",
        variant: "destructive",
      });
      return;
    }
    addToCart(item, restaurant.id, restaurant.name);
    toast({
      title: 'Added to cart',
      description: `${item.name} added to your cart`,
    });
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN': return 'bg-success/10 text-success';
      case 'CLOSING_SOON': return 'bg-destructive/10 text-destructive';
      case 'OPENING_SOON': return 'bg-yellow-500/10 text-yellow-600';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'OPEN': return 'Open';
      case 'CLOSING_SOON': return 'Closing Soon';
      case 'OPENING_SOON': return 'Opening Soon';
      default: return 'Closed';
    }
  };

  return (
    <div className="pb-24 lg:pb-8">
      {/* Header Image */}
      <div className="relative h-48 lg:h-64">
        <img
          src={restaurant.image}
          alt={restaurant.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
      </div>

      {/* Restaurant Info */}
      <div className="px-4 lg:px-8 -mt-16 relative z-10 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border rounded-xl p-6 shadow-lg"
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground mb-1">{restaurant.name}</h1>
              <p className="text-muted-foreground">{restaurant.cuisine}</p>
            </div>
            <span className={cn(
              'px-3 py-1 text-sm font-medium rounded-full',
              getStatusColor(status)
            )}>
              {getStatusText(status)}
            </span>
          </div>

          <div className="flex flex-wrap gap-4 text-sm mb-4">
            <span className="flex items-center gap-1 text-foreground">
              <Star className="w-4 h-4 text-warning fill-warning" />
              {restaurant.rating} Rating
            </span>
            <span className="flex items-center gap-1 text-muted-foreground">
              <Clock className="w-4 h-4" />
              {restaurant.deliveryTime}
            </span>
            <span className="flex items-center gap-1 text-muted-foreground">
              <Phone className="w-4 h-4" />
              {restaurant.phone}
            </span>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4" />
            {restaurant.address}
          </div>

          <p className="text-muted-foreground mt-4 text-sm">{restaurant.description}</p>
        </motion.div>

        {/* Dietary Toggle (Zomato Style) */}
        <div className="mt-6 flex items-center gap-4">
          <button
            onClick={() => setVegMode(!vegMode)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl border transition-all text-sm font-medium",
              vegMode ? "bg-green-50 border-green-200 text-green-700 shadow-sm" : "bg-white border-border text-foreground hover:bg-muted"
            )}
          >
            <span className="w-4 h-4 rounded-sm border-2 border-green-600 flex items-center justify-center">
              <span className="w-1.5 h-1.5 rounded-full bg-green-600" />
            </span>
            Veg
          </button>

          <button
            onClick={() => setNonVegMode(!nonVegMode)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl border transition-all text-sm font-medium",
              nonVegMode ? "bg-red-50 border-red-200 text-red-700 shadow-sm" : "bg-white border-border text-foreground hover:bg-muted"
            )}
          >
            <span className="w-4 h-4 rounded-sm border-2 border-red-600 flex items-center justify-center">
              <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
            </span>
            Non-Veg
          </button>
        </div>

        {/* Category Tabs */}
        <div className="mt-6 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={cn(
                'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors',
                selectedCategory === category
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-foreground hover:bg-secondary/80'
              )}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Menu Items */}
        <div className="mt-6 space-y-4">
          {isLoadingMenu ? (
            <div className="flex justify-center p-8">
              <span className="text-muted-foreground animate-pulse text-lg font-medium">Loading Menu...</span>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center border rounded-xl border-dashed bg-muted/20">
              <Utensils className="w-10 h-10 text-muted-foreground mb-4 opacity-50" />
              <h3 className="text-xl font-semibold text-foreground mb-1">No items found</h3>
              <p className="text-muted-foreground">Try adjusting your dietary preferences or category.</p>
            </div>
          ) : (
            filteredItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={cn(
                  'bg-card border border-border rounded-xl p-4 flex gap-4',
                  !item.isAvailable && 'opacity-50'
                )}
              >
                <div className="relative">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-24 h-24 rounded-xl object-cover"
                  />
                  {item.dietaryType === 'Veg' ? (
                    <span className="absolute top-1 left-1 w-5 h-5 bg-white border border-green-200 rounded flex items-center justify-center">
                      <span className="w-2.5 h-2.5 rounded-full bg-green-600" />
                    </span>
                  ) : (
                    <span className="absolute top-1 left-1 w-5 h-5 bg-white border border-red-200 rounded flex items-center justify-center">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-600" />
                    </span>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-foreground">{item.name}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-lg font-bold text-foreground">₹{item.price.toFixed(2)}</span>
                    {item.isAvailable ? (
                      getCartQuantity(item.id) > 0 ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              const current = getCartQuantity(item.id);
                              if (current > 0) {
                                updateCartQuantity(item.id, current - 1);
                              }
                            }}
                            className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center hover:bg-secondary/80"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-8 text-center font-medium">{getCartQuantity(item.id)}</span>
                          <button
                            onClick={() => handleAddToCart(item)}
                            className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => handleAddToCart(item)}
                          className="gap-1"
                        >
                          <Plus className="w-4 h-4" />
                          Add
                        </Button>
                      )
                    ) : (
                      <span className="px-2 py-1 bg-red-100 text-red-600 text-xs font-bold rounded-md uppercase tracking-wide">
                        Out of Stock
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Floating Cart Button */}
      {cartCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-20 lg:bottom-8 left-4 right-4 lg:left-auto lg:right-8 lg:w-80 z-50"
        >
          <Button
            onClick={() => {
              if (!isOpen) {
                toast({
                  title: "Restaurant Closed",
                  description: "This restaurant is currently closed. You cannot place orders.",
                  variant: "destructive"
                });
                return;
              }
              navigate('/user/cart');
            }}
            className={cn(
              "w-full h-14 gap-3 shadow-xl",
              !isOpen && "opacity-75 cursor-not-allowed bg-gray-500 hover:bg-gray-600"
            )}
            size="lg"
            disabled={!isOpen}
          >
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              <span>{cartCount} items</span>
            </div>
            <span className="ml-auto font-bold">
              {isOpen ? `₹${cartTotal.toFixed(2)}` : 'Closed'}
            </span>
          </Button>
        </motion.div>
      )}
    </div>
  );
}
