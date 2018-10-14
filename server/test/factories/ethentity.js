// test/factories/user.js

import faker from 'faker';

import models from 'models';

/**
 * Generate an object which container attributes needed
 * to successfully create a user instance.
 * 
 * @param  {Object} props Properties to use for the user.
 * 
 * @return {Object}       An object to build the user from.
 */
const data = async (props = {}) => {
  var now = new Date();

  const defaultProps = {
    address: "0xde0b295669a9fd93d5f28d9ec85e40f4cb697bae",
    balance: 0
  };

  return Object.assign({}, defaultProps, props);
};

/**
 * Generates a user instance from the properties provided.
 * 
 * @param  {Object} props Properties to use for the user.
 * 
 * @return {Object}       A user instance
 */
export default async (props = {}) =>
  models.EthEntity.create(await data(props));