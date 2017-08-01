import React, { Component } from 'react';

/**
 * The SelectTickers class component
 */
export default class SelectTickers extends Component {

  /**
   * Handle user selection of a ticker from the dropdown
   * @function
   */
  handleOptionSelect(event) {
    this.props.updateSelectedTickers(event.target.value);
  }

  /**
   * Handle user click on 'REGENERATE ASSET CORRELATIONS' button
   * @function
   */
  handleGenerateCorClick(event) {
    /** Prevent default form submission behavior */
    event.preventDefault();
    this.props.handleGenerateCorClick();
  }

  /** 
  * Render the 'Select Tickers to Compare' section, including the dropdown menu
  * and 'REGENERATE ASSET CORRELATIONS' button
  */
  render() {
    const allTickers = this.props.allTickers;

    return (
      <form className='select-tickers' onSubmit={this.handleGenerateCorClick.bind(this)}>
        <h2>Select tickers to compare (at least 2): </h2>
        <select onChange={this.handleOptionSelect.bind(this)}>
          <option defaultValue> -- select an option -- </option>
          {
            allTickers.map((ticker, index) => {
              return (
                <option value={ticker} key={index}>{ticker}</option>
              );
            })
          }
        </select>
        <input
          className='generate-asset-btn' 
          type='submit'
          value='regenerate asset correlations'
        /> 
      </form>
    )
  }
}