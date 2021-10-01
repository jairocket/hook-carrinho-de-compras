import React from 'react';
import { Link } from 'react-router-dom';
import { MdShoppingBasket } from 'react-icons/md';

import logo from '../../assets/images/logo.svg';
import { Container, Cart } from './styles';
import { useCart } from '../../hooks/useCart';
import { Product } from '../../types';


const Header = (): JSX.Element => {
  const { cart } = useCart();
  
  console.log(cart)
  const cartSize = cart.reduce((unique: Product[], o)=>{
    if(!unique.some(obj => obj.id === o.id)){
      unique.push(o)
    }
    return unique
  }, []).length

  console.log(cartSize)
    
  
  return (
    <Container>
      <Link to="/">
        <img src={logo} alt="Rocketshoes" />
      </Link>

      <Cart to="/cart">
        <div>
          <strong>Meu carrinho</strong>
          <span data-testid="cart-size">
            {cartSize === 1 ? `${cartSize} item` : `${cartSize} itens`}
          </span>
        </div>
        <MdShoppingBasket size={36} color="#FFF" />
      </Cart>
    </Container>
  );
};

export default Header;
