export const products = {
  categories: [
    {
      id: 'pizzas',
      name: 'Pizzas',
      icon: '🍕',
      active: true
    },
    {
      id: 'hamburguesas',
      name: 'Hamburguesas',
      icon: '🍔',
      active: true
    },
    {
      id: 'bebidas',
      name: 'Bebidas',
      icon: '🥤',
      active: true
    },
    {
      id: 'entrantes',
      name: 'Entrantes',
      icon: '🍟',
      active: true
    },
    {
      id: 'postres',
      name: 'Postres',
      icon: '🍰',
      active: true
    }
  ],
  items: [
    // Pizzas
    {
      id: 'pizza-margherita',
      name: 'Pizza Margarita',
      price: 12.90,
      category: 'pizzas',
      active: true,
      description: 'Tomate, mozzarella y albahaca'
    },
    {
      id: 'pizza-pepperoni',
      name: 'Pizza Pepperoni',
      price: 14.90,
      category: 'pizzas',
      active: true,
      description: 'Tomate, mozzarella y pepperoni'
    },
    {
      id: 'pizza-4quesos',
      name: 'Pizza 4 Quesos',
      price: 16.90,
      category: 'pizzas',
      active: true,
      description: 'Mozzarella, gorgonzola, parmesano y provolone'
    },
    
    // Hamburguesas
    {
      id: 'burger-clasica',
      name: 'Hamburguesa Clásica',
      price: 9.90,
      category: 'hamburguesas',
      active: true,
      description: 'Carne, lechuga, tomate, cebolla y salsa especial'
    },
    {
      id: 'burger-bacon',
      name: 'Hamburguesa con Bacon',
      price: 11.90,
      category: 'hamburguesas',
      active: true,
      description: 'Carne, bacon, queso, lechuga y tomate'
    },
    {
      id: 'burger-veggie',
      name: 'Hamburguesa Vegetal',
      price: 10.90,
      category: 'hamburguesas',
      active: true,
      description: 'Hamburguesa de lentejas con vegetales frescos'
    },
    
    // Bebidas
    {
      id: 'coca-cola',
      name: 'Coca Cola',
      price: 2.50,
      category: 'bebidas',
      active: true,
      description: '33cl'
    },
    {
      id: 'agua',
      name: 'Agua Mineral',
      price: 1.50,
      category: 'bebidas',
      active: true,
      description: '50cl'
    },
    {
      id: 'cerveza',
      name: 'Cerveza',
      price: 3.00,
      category: 'bebidas',
      active: true,
      description: '33cl'
    },
    
    // Entrantes
    {
      id: 'patatas-bravas',
      name: 'Patatas Bravas',
      price: 5.90,
      category: 'entrantes',
      active: true,
      description: 'Patatas fritas con salsa brava y alioli'
    },
    {
      id: 'nachos',
      name: 'Nachos con Queso',
      price: 6.90,
      category: 'entrantes',
      active: true,
      description: 'Nachos con queso fundido y jalapeños'
    },
    
    // Postres
    {
      id: 'tiramisu',
      name: 'Tiramisú',
      price: 4.90,
      category: 'postres',
      active: true,
      description: 'Tiramisú casero'
    },
    {
      id: 'flan',
      name: 'Flan de la Casa',
      price: 3.90,
      category: 'postres',
      active: true,
      description: 'Flan casero con caramelo'
    }
  ]
};

export default products;