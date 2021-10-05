import React, { useState, useEffect } from 'react';
import { MdAddShoppingCart } from 'react-icons/md';

import { ProductList } from './styles';
import { api } from '../../services/api';
import { formatPrice } from '../../util/format';
import { useCart } from '../../hooks/useCart';

interface Product {
  id: number;
  title: string;
  price: number;
  image: string;
}

interface ProductFormatted extends Product {
  priceFormatted: string;
}

interface CartItemsAmount {
  [key: number]: number;
}

const Home = (): JSX.Element => {
  const [products, setProducts] = useState<ProductFormatted[]>([]);
  const { addProduct, cart } = useCart();
  console.log(cart)

  const cartItemsAmount = cart.reduce((sumAmount, product) => {
    const key = product.id
    sumAmount[key] = product.amount
    return sumAmount
     //TODO
  }, {} as CartItemsAmount)

  useEffect(() => {
    async function loadProducts() {
      const {data} = await api.get<Product[]>('products')
      
      let priceFormatted = ''
      let form = data.map((product) => {
        priceFormatted = formatPrice(product.price)
        let productFormated = {
          id: product.id,
          title: product.title,
          price: product.price,
          image: product.image,
          priceFormatted

        }
        return productFormated
      })
      setProducts(form)
      //tested
    }

    loadProducts();
    
  }, []);

  function handleAddProduct(id: number) {
    addProduct(id)
    console.log(cart)
    //localStorage.setItem('@RocketShoes:cart', JSON.stringify(cart))
    // tested
  }
  
  return (
    <ProductList>
      {products.map((product) =>{
        return(
          <li key={product.id}>
          <img src={product.image} alt="Tênis de Caminhada Leve Confortável" />
          <strong>{product.title}</strong>
          <span>{product.priceFormatted}</span>
          <button
            type="button"
            data-testid="add-product-button"
            onClick={() => handleAddProduct(product.id)}
          >
            <div data-testid="cart-product-quantity">
              <MdAddShoppingCart size={16} color="#FFF" />
              {cartItemsAmount[product.id] || 0} 
            </div>
  
            <span>ADICIONAR AO CARRINHO</span>
          </button>
        </li>

        )
      }

      )}

    </ProductList>
  );
};

export default Home;
