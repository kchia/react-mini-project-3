import React, { Component } from 'react';

/**
 * Create a map of ticker correlations.
 * @function
 * @param {Array} correlations - an array of objects containing ticker-pair names and
 * their correlation (e.g., [{pair: ['MSFT', 'GOOG'], value: 0.67}, {pair: ['VTI', 'GOOG'], value: 0.68}])
 * @return {Object} A map of ticker-pairs (e.g., 'MSFT-GOOG') to their correlation values
 */
const mapTickerCorrelations = (correlations) => {
  let correlationsMap = {};
  let pair;
  let mirrorPair;

  for(let correlation of correlations) {
    pair = correlation.pair.join('-'); 

    /** 'MSFT-GOOG' and 'GOOG-MSFT' have the same corr values, so sufficient
    to store just one of them to the map */
    mirrorPair = correlation.pair.reverse().join('-');

    if(!correlationsMap[pair] && !correlationsMap[mirrorPair]) {
      /** Set value to null for duplicate ticker pairs e.g., ['MSFT','MSFT'] */
      correlationsMap[pair] = correlation.pair[0] !== correlation.pair[1] ? 
        correlation.value : null;      
    }

  }

  return correlationsMap;
};

/**
 * Get the upper and lower bounds from a map.
 * @function
 * @param {Object} map - ticker correlations map (e.g., {'MSFT-GOOG': 0.96, 'ADBE-VIT': -0.56})
 * @return {Object} object containing the lower and upper bound values for a given map
 */
const getBounds = (map) => {
  let values = Object.values(map);
  let lower = Math.min(...values);
  let upper = Math.max(...values);

  /** Ignore positive values for the lower bound; as we are only
  * interested in negative values for the lower bound
  */ 
  if(lower > 0) lower = null;

  return { lower, upper };
};

/**
 * Get the correlation value from a map.
 * @function
 * @param {String} firstTicker - first ticker name in the pair being compared
 * @param {String} secondTicker - second ticker name in the pair being compared 
 * @param {Array} tickerCorrelationsMap - ticker correlations map 
 * (e.g., {'MSFT-GOOG': 0.96, 'ADBE-VIT': -0.56})
 * @return {Number} correlation value;
 */
const getCorrelationvalue = (firstTicker, secondTicker, tickerCorrelationsMap) => {
  let correlationsMapKey = firstTicker + '-' + secondTicker;
  let mirrorCorrelationsMapKey = secondTicker + '-' + firstTicker;

  return tickerCorrelationsMap[correlationsMapKey] || tickerCorrelationsMap[mirrorCorrelationsMapKey];
};

/**
 * Get the correlation values for a given row in the table.
 * @function
 * @param {String} rowTicker - the ticker name in the row header 
 * @param {Array} tickersCol - array of ticker names in the col headers
 * @param {Array} correlations - an array of objects containing ticker-pair names and
 * their correlation (e.g., [{pair: ['MSFT', 'GOOG'], value: 0.67}, {pair: ['VTI', 'GOOG'], value: 0.68}])
 * @return {Array} array of correlation values;
 */
const getCorrelationValuesByRow = (rowTicker, tickersCol, correlations) => {
  const tickerCorrelationsMap = mapTickerCorrelations(correlations);
  let correlationValues = [];
  let correlationValue;

  for(let tickerCol of tickersCol) {
    correlationValue = getCorrelationvalue(rowTicker, tickerCol, tickerCorrelationsMap);
    correlationValues.push(correlationValue);
  }

  return correlationValues;
};

/**
 * Attach class to a ticker cell based on its value
 * @function
 * @param {Number} value - correlation value for ticker pair
 * @param {Number} lowerBound - lower bound for comparison
 * @param {Number} upperBound - upper bound for comparison
 * @return {String} class name
 */
const getTickerValueColor = (value, lowerBound, upperBound) => {
  let colorClass = 'ticker-default';
  if(value === lowerBound) colorClass = 'ticker-lower-bound';
  if(value === upperBound) colorClass = 'ticker-upper-bound';
  return colorClass;
};

/**
 * The AssetCorrelationsTable class component
 */
export default class AssetCorrelationsTable extends Component {

  render() {
    const tickersCompared = this.props.tickerCorrelations.tickers;
    const tickerCorrelationsMap = mapTickerCorrelations(this.props.tickerCorrelations.correlations);
    const bounds = getBounds(tickerCorrelationsMap);

    return tickersCompared.length > 0 ? (
      <div>
        <div className='legend'>
          <div className='legend-most-positive'>Most Positively Correlated </div>
          <div className='legend-most-negative'>Most Negatively Correlated </div>
        </div>
        <table className='asset-correlations-table'>
          <caption className='asset-correlations-table-caption' >Asset Correlations Table</caption>
          <thead>
            <tr>
              <td className='row-col-title'>Ticker</td>
              {
                tickersCompared.map((ticker, index) => {
                  return (
                    <th scope='col' key={index}>{ticker}</th>
                  )
                }) 
              }
            </tr>
          </thead>
          <tbody>
            {
              tickersCompared.map((ticker, index) => {
                return (
                  <tr key={index}>
                    <th scope='row'>{ticker}</th>
                    { 
                      getCorrelationValuesByRow(ticker,
                      this.props.tickerCorrelations.tickers,
                      this.props.tickerCorrelations.correlations).map((value, index) => {
                        return <td 
                          className={getTickerValueColor(value, bounds.lower, bounds.upper)}
                          key={index}
                        >
                          { value ? value.toFixed(2) : '-' }
                        </td>})
                    }
                  </tr>
                )
              }) 
            }
          </tbody>
        </table>
      </div>
    ) : <div></div>
  }
}