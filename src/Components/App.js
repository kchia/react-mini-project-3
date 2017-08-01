import React, { Component } from 'react';
import SelectTickers from './SelectTickers.js';
import AssetCorrelationsTable from './AssetCorrelationsTable.js';
import '../App.css';

/**
 * The App class component is the 'parent' app component.
 */
export default class App extends Component {

  /** Initialize state with a constructor function. */
  constructor() {
    super();
    this.state = {

      /** Universe of tickers */
      allTickers: [],

      /** Tickers selected by the user for comparison */
      selectedTickers: [],

      /** Ticker correlations*/
      tickerCorrelations: {
        correlations: [],
        tickers: []
      },

      /** Is true or false depending on whether there's an error
      * with form submission
      */
      hasInputError: false
    };

    /** Use baseState to reference the initial state */
    this.baseState = this.state;
  }

  /**
   * Add a ticker to the list of user selected tickers &
   * refresh asset correlations table 
   * @function
   * @param {String} ticker - ticker name (e.g., 'MSFT')
   */
  updateSelectedTickers(ticker) {
    let selectedTickers = this.state.selectedTickers.slice();

    /** Ensure the ticker is inserted at most once to the 
    selected tickers array. */
    if(selectedTickers.indexOf(ticker) === -1) {
      selectedTickers.push(ticker);
    }

    this.setState({
      selectedTickers
    }, () => this.generateAssetCorrelations());
  }

  /**
   * Update the error state. 
   * @function
   * @param {Boolean} trueOrFalse - set to true if there's an error
   * with user input
   */
  updateErrorState(trueOrFalse) {
    this.setState({
      hasInputError: trueOrFalse
    });
  }

  /**
   * Make a GET request to server to fetch universe of tickers.
   * @function
   */
  getTickers() {
    fetch('http://k-fe-practical.herokuapp.com/api/tickers/')
      .then((response) => response.json())
      .then((data) => {
        this.setState({
          allTickers: data.tickers
        }, () => console.log('Successfully fetched and set tickers: ' +  this.state.allTickers))
      })
      .catch((error) => {
        console.error(error);
      });
  }

  /**
   * Make a GET request to server to fetch ticker correlations for selected tickers.
   * @function
   * @param {Array} tickers - array of ticker names (e.g., ['MSFT', 'GOOG', 'ADBE'])
   * with user input
   */
  getTickerCorrelations(tickers) {

    /** Helper function to create query string for url */
    const createQueryStr = (tickers) => {
      let query = tickers.map((ticker) => {
        return 'tickers=' + ticker;
      }).join('&');

      return query;
    }

    fetch('http://k-fe-practical.herokuapp.com/api/correlation/?' + createQueryStr(tickers))
      .then((response) => response.json())
      .then((data) => {
        this.setState({
          tickerCorrelations: data
        }, () => console.log('Successfully fetched and set ticker correlations: '
          +  this.state.tickerCorrelations))
      })
      .catch((error) => {
        console.error(error);
      });
  }

  /**
   * Generate asset correlations table, if there are at least 2 selected tickers
   * @function
   */
  generateAssetCorrelations() {
    let selectedTickers = this.state.selectedTickers;

    /** Trigger error state when user attempts to submit fewer than 2 tickers */
    if(selectedTickers.length < 2) {
      this.updateErrorState(true);
    } else {
      this.updateErrorState(false);
      this.getTickerCorrelations(this.state.selectedTickers);
    }
  }

  /**
   * Handle user click on 'REGENERATE ASSET CORRELATIONS' button
   * @function
   */
  handleGenerateCorClick() {
    this.generateAssetCorrelations();
  }

  /**
   * Handle user click on 'RESET' button
   * @function
   */
  handleReset() {
    this.setState(this.baseState);

    /** Re-fetching tickers via the network in case any new tickers 
    * surfaced since the initial fetch */
    this.getTickers();
  }

  /**
   * A React component lifecycle method that is invoked immediately 
   * after a component is mounted. 
   * @function
   */
  componentDidMount() {
    this.getTickers();
  }

  /**
   * Render error message
   * @function
   */
  renderErrorMessage() {
    return (
      <p className='error-message'>You must select at least 2 tickers to compare!</p>
    )
  }


  /** Renders the app and its child components 'SelectTickers' & 'AssetCorrelationsTable'. 
  Data are passed from App to children via props */
  render() {
    let selectedTickers = this.state.selectedTickers;

    return (
      <div className="App">
        <h1>Kensho Asset Correlations</h1>
        <div className='selected-tickers'>
          You&apos;ve selected these tickers to compare: {
            selectedTickers.length ?
              this.state.selectedTickers.map((ticker, index) => {
                return (
                  <p className='selected-ticker' key={index}>{ticker} </p>
                )
              }) : 'None'
          }
        </div>
        {
          this.state.hasInputError && this.renderErrorMessage() 
        }
        <SelectTickers
          allTickers={this.state.allTickers}
          updateSelectedTickers={this.updateSelectedTickers.bind(this)}
          handleGenerateCorClick={this.handleGenerateCorClick.bind(this)}
        />
        <button className='reset-btn' onClick={this.handleReset.bind(this)}>restart</button> 
        <AssetCorrelationsTable
          tickerCorrelations={this.state.tickerCorrelations}
        />
      </div>
    );
  }
}

