let config = {}
module.exports = {
  setEnvironment: function (environment) {
    config = require('./' + environment + '.json')
  },
  get: function () {
    return config
  }
}
