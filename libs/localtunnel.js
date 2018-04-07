const localtunnel = require('localtunnel')

const config = _require('configs/server')

const port = config.get('port')
const subdomain = config.get('localtunnel.subdomain')

const tunnel = localtunnel(port, { subdomain }, (err, tunnel) => {
  if (err) console.log(`localtunnel [error]: ${JSON.stringify(err)}`)
  console.log(`localtunnel [url]: ${tunnel.url}`)
})

tunnel.on('close', function() {
  console.log(`localtunnel [event]: Closed`)
})
