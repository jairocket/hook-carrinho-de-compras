import { createContext, ReactNode, useContext, useState } from 'react';
import { toast } from 'react-toastify';
import { api } from '../services/api';
import { Product, Stock } from '../types';

interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;
}

interface CartContextData {
  cart: Product[];
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const [cart, setCart] = useState<Product[]>(() => {
    const storagedCart = localStorage.getItem('@RocketShoes:cart');

    if (storagedCart) {
      setCart([...cart, ...JSON.parse(storagedCart)]);
      return JSON.parse(storagedCart);
    }
    
    return [];
  });

  const addProduct = async (productId: number) => {
    try {
      const storagedCart = localStorage.getItem('@RocketShoes:cart');
      const {data} = await api.get<Stock>(`stock/${productId}`)
      if(data.amount === 0) toast.error('Quantidade solicitada fora de estoque')
      if (storagedCart) {
        let products = JSON.parse(storagedCart)
        const product = await api.get<Product>(`products/${productId}`)
        if(products.some((item: Product) => item.id === productId)){
          const updatedCart = products.filter((item: Product)=>{ 
            if(item.id === productId){
              return item.amount += 1
            }else{
              return item.amount
            }
              
          })
          setCart([...cart, ...updatedCart])
          localStorage.setItem('@RocketShoes:cart', JSON.stringify(cart))
        }else{
          setCart([...cart, product.data])
          localStorage.setItem('@RocketShoes:cart', JSON.stringify(cart))
        }
      }else{
        const product = await api.get<Product>(`products/${productId}`)
        setCart([...cart, product.data])
        localStorage.setItem('@RocketShoes:cart', JSON.stringify(cart))
      }   
    } catch {
      toast.error('Erro na adição do produto')
      // TODO
    }
  };

  const removeProduct = (productId: number) => {
    try {
      const storagedCart = localStorage.getItem('@RocketShoes:cart');
      if(storagedCart){
        const updatedCart = JSON.parse(storagedCart).filter((item: Product) => item.id !== productId);
        setCart([...cart, ...updatedCart])
      }
      // TODO
    } catch {
      // TODO
      toast.error('Erro na remoção do produto')
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      if(amount === 0) return;
      const {data} = await api.get<Stock>(`stock/${productId}`);
      if(data.amount > amount) toast.error('Quantidade solicitada fora de estoque');
      const storagedCart = localStorage.getItem('@RocketShoes:cart');
      if(storagedCart){
        const updatedCart = JSON.parse(storagedCart).filter((item: Product) => {
          if(item.id === productId) {
            return item.amount = amount
          }else{
            return item.amount
          };
        });
        setCart([...cart, updatedCart])
      }
      // TODO
    } catch {
      toast.error('Erro na alteração de quantidade do produto')
      // TODO
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, addProduct, removeProduct, updateProductAmount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}
