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
      return JSON.parse(storagedCart);
    }
    
    return [];
  });

  const addProduct = async (productId: number) => { //tested
    try {
        const product = await api.get<Product>(`products/${productId}`)
        if(!product.data.id) {
          toast.error('Erro na adição do produto')
          return
        }
        let formProduct =  {
          id: product.data.id,
          title: product.data.title,
          price: product.data.price,
          image: product.data.image,
          amount: 1
        }
        const repeated = cart.find((item: Product) => item.id === productId)
        if(repeated){ 
          const stock = await api.get<Stock>(`stock/${productId}`)
                  
          const order = {
            productId: repeated.id,
            amount: repeated.amount > stock.data.amount ? stock.data.amount : repeated.amount + 1
          }
          updateProductAmount(order) 
          return                      
        }
          setCart([formProduct, ...cart ])
          localStorage.setItem('@RocketShoes:cart', JSON.stringify([formProduct, ...cart])) 
    } catch {
      
      toast.error('Erro na adição do produto')
      // TODO
    }
  };

  const removeProduct = (productId: number) => { //tested
    try {
        const item = cart.find(item => item.id === productId);
        if(!item?.id){
          toast.error('Erro na remoção do produto')
          return
        }

        const updatedCart = cart.filter((item: Product) => item.id !== productId);
        setCart([...updatedCart])
        localStorage.setItem('@RocketShoes:cart', JSON.stringify(updatedCart))
           

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
      if(amount < 1) {
        return
      }

      const {data} = await api.get<Stock>(`stock/${productId}`);
      if(data.amount < 1){
        toast.error('Quantidade solicitada fora de estoque')
      }


      if(data.amount >= amount){
        const updatedCart =[]
        for(let product of cart){
          if(product.id === productId){
            product.amount = amount
            updatedCart.push(product)
          }else{
            updatedCart.push(product)
          }
        }
        setCart([...updatedCart])
        localStorage.setItem('@RocketShoes:cart', JSON.stringify(updatedCart))
        
      }else{
        toast.error('Quantidade solicitada fora de estoque')
      }     
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

