export default (state={addresses: []}, action) => {
  switch(action.type) {
    case 'HOME_PAGE_LOADED':
      return {
        ...state,
        addresses: action.data.addresses,
      };
    case 'SUBMIT_ADDRESS':
      return {
        ...state,
        addresses: ([action.data.address]).concat(state.addresses),
      };
    case 'DELETE_ADDRESS':
      return {
        ...state,
        addresses: state.addresses.filter((address) => address._id !== address.id),
      };
    case 'SET_EDIT':
      return {
        ...state,
        addressToEdit: action.address,
      };
    case 'EDIT_ADDRESS':
      return {
        ...state,
        addresses: state.addresses.map((address) => {
          if(address._id === action.data.address._id) {
            return {
              ...action.data.address,
            }
          }
          return address;
        }),
        addressToEdit: undefined,
      }
    default:
		return state;
  }
};