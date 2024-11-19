const WAVE_URL = 'https://gql.waveapps.com/graphql/public';
const fetch = require('node-fetch');
const config = require('../config')
const waveBusinessId = config.get().waveHgBusinessId;
const FinanceController = {}

FinanceController.listAccounts = async function (req, res) {
    const response = await fetch(WAVE_URL, {
        method: 'POST',
        headers: {
            'Authorization': 'Bearer ' + config.get().waveAccounting,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            query: `query {
                           business(id:"${waveBusinessId}"){
                           accounts(pageSize:300){
                           edges{
                                node{
                                    displayId,
                                    name,
                                    type {
                                        name,
                                        value
                                    },
                                    balance                                  
                                }                              
                          }
                        }  
                    }
                }`,
            variables: {}
        })
    });
    const categories = await response.json();
    res.send(
        categories.data.business.accounts.edges
    );
}

module.exports = FinanceController;
