import React from 'react';
import axios from 'axios';
import { connect } from 'react-redux';

import { Form } from '../../components/Address';

class Home extends React.Component {
  componentDidMount() {
    const { onLoad } = this.props;

    axios('http://localhost:8000/addresses')
      .then((res) => onLoad(res.data));
  }
  render() {
    const { addresses } = this.props;

    return (
      <div className="container">
        <div className="row pt-5">
          <div className="col-12 col-lg-6 offset-lg-3">
            <h1 className="text-center">SamSplorer</h1>
          </div>
          <Form />
        </div>
        <div className="row pt-5">
          <div className="col-12 col-lg-6 offset-lg-3">
            {addresses.map((address,i) => {
              return (
                <div className="card my-3" key={address.address}>
                  <div className="card-header">
                    {address.address} 
                  </div>
                  <div className="card-body">
                    <p className="mt-5 text-muted"><b>Pending</b>Transaction and balance info will be here evenetually.</p>
                  </div>
                  <div className="card-footer">
                    <div className="row">
                      <button onClick={() => this.handleEdit(address)} className="btn btn-primary mx-3">
                        Edit
                      </button>
                      <button onClick={() => this.handleDelete(address._id)} className="btn btn-danger">
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  addresses: state.home.addresses,
});

const mapDispatchToProps = dispatch => ({
  onLoad: data => dispatch({ type: 'HOME_PAGE_LOADED', data }),
  onDelete: id => dispatch({ type: 'DELETE_ARTICLE', id }),
  setEdit: address => dispatch({ type: 'SET_EDIT', address }),
});

export default connect(mapStateToProps, mapDispatchToProps)(Home);