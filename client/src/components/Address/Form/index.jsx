import axios from 'axios';
import React from 'react';
import { connect } from 'react-redux';

class Form extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      address: '',
    }

    this.handleChangeField = this.handleChangeField.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    if(nextProps.addressToEdit) {
      this.setState({
        address: nextProps.addressToEdit.address,
      });
    }
  }

  handleSubmit(){
    const { onSubmit, addressToEdit, onEdit } = this.props;
    const { address } = this.state;

    if(!addressToEdit) {
      console.log("No address to edit.  Creating it anew!");

      return axios.post('http://localhost:8000/addresses', {
        address,
      })
      .then((res) => onSubmit(res.data))
      .then(() => this.setState({ address: '' }));
    } else {
      return axios.patch(`http://localhost:8000/addresses/${addressToEdit._id}`, {
        address,
      })
        .then((res) => onEdit(res.data))
        .then(() => this.setState({ address: '' }));
    }
  }

  handleChangeField(key, event) {
    this.setState({
      [key]: event.target.value,
    });
  }

  render() {
    const { addressToEdit } = this.props;
    const { address } = this.state;

    return (
      <div className="col-12 col-lg-6 offset-lg-3">
        <input
          onChange={(ev) => this.handleChangeField('address', ev)}
          value={address}
          className="form-control my-3"
          placeholder="Ethereum Address"
        />
        <button onClick={this.handleSubmit} className="btn btn-primary float-right">{addressToEdit ? 'Update' : 'Submit'}</button>
      </div>
    )
  }
}

const mapDispatchToProps = dispatch => ({
  onSubmit: data => dispatch({ type: 'SUBMIT_address', data }),
  onEdit: data => dispatch({ type: 'EDIT_address', data }),
});

const mapStateToProps = state => ({
  addressToEdit: state.home.addressToEdit,
});

export default connect(mapStateToProps, mapDispatchToProps)(Form);