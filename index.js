const config = require('./configs/server')
const app = require('./app')
const logger = _require('libs/Logger')

const port = config.get('port')

app.listen(port, () => {
  logger.info(`Listening to port: ${port}`)
})
