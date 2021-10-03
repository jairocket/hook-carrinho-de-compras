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
      const storagedCart = localStorage.getItem('@RocketShoes:cart');
      const {data} = await api.get<Stock>(`stock/${productId}`)
      if(data.amount === 0) toast.error('Quantidade solicitada fora de estoque')
      if (storagedCart) {
        const product = await api.get<Product>(`products/${productId}`)
        let formProduct =  {
          id: product.data.id,
          title: product.data.title,
          price: product.data.price,
          image: product.data.image,
          amount: 1
        }
        const repeated = cart.find((item: Product) => item.id === productId)
        console.log(repeated)
        if(repeated){
            const order = {
              productId: repeated.id,
              amount: repeated.amount = repeated.amount + 1
            }   
            updateProductAmount(order)                       
        }else{
          
          setCart([...cart, formProduct])
          localStorage.setItem('@RocketShoes:cart', JSON.stringify([...cart, formProduct]))
        }
      } 
    } catch {
      toast.error('Erro na adição do produto')
      // TODO
    }
  };

  const removeProduct = (productId: number) => { //tested
    try {
      const storagedCart = localStorage.getItem('@RocketShoes:cart');
      if(storagedCart){
        const updatedCart = JSON.parse(storagedCart).filter((item: Product) => item.id !== productId);
        setCart([...updatedCart])
        localStorage.setItem('@RocketShoes:cart', JSON.stringify(updatedCart))
        
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
      console.log(data.amount)
      console.log(amount)
      if(data.amount < amount) toast.error('Quantidade solicitada fora de estoque');
      const storagedCart = localStorage.getItem('@RocketShoes:cart');
      
      if(storagedCart){
        console.log(storagedCart)
        const upCartRaw = JSON.parse(storagedCart).filter((item: Product)=> {return item.id !== productId})
        const updatedProductRaw = JSON.parse(storagedCart).filter((item: Product)=> item.id === productId)
        const updatedProduct = {
            
          id: updatedProductRaw[0].id,
          title: updatedProductRaw[0].title,
          price: updatedProductRaw[0].price,
          image: updatedProductRaw[0].image,
          amount: amount
        
      }
      setCart([...upCartRaw, updatedProduct])
      localStorage.setItem('@RocketShoes:cart', JSON.stringify(cart))

        console.log(cart)
      }
      
      // TODO
    } catch {
      toast.error('Erro na alteração de quantidade do produto')
      // TODO
    }
  };
  console.log(cart)
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
