import {ImageSourcePropType} from 'react-native';

export interface DataType {
  cardId: number;
  name: string;
  number: string;
  image: ImageSourcePropType;
  backgroundColor: string;
}

const data: DataType[] = [
  {
    cardId: 1,
    name: 'All Category',
    number: '',
    image: require('../../../assets/icons/box.png'),
    backgroundColor: '#6d85a4',
  },
  {
    cardId: 2,
    name: 'Fresh Produce',
    number: '',
    image: require('../../../assets/icons/produceBasket.png'),
    backgroundColor: '#66BB6A',
  },
  {
    cardId: 3,
    name: 'Cold Storage',
    number: '',
    image: require('../../../assets/icons/coldStorage.png'),
    backgroundColor: '#00BCD4',
  },
  {
    cardId: 4,
    name: 'Meat',
    number: '',
    image: require('../../../assets/icons/meat.png'),
    backgroundColor: '#FF5252',
  },
  {
    cardId: 5,
    name: 'Drinks',
    number: '',
    image: require('../../../assets/icons/drinks.png'),
    backgroundColor: '#86b4ee',
  },
  {
    cardId: 6,
    name: 'Pantry',
    number: '',
    image: require('../../../assets/icons/snackBar.png'),
    backgroundColor: '#FFA000',
  },
  
];

export {data};
