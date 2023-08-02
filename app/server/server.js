
import express from 'express'
import DHT from 'hyperdht'
import goodbye from 'graceful-goodbye'
import b4a from 'b4a'

const app = new express()
const dht = new DHT()

// This keypair is your peer identifier in the DHT
const keyPair = DHT.keyPair()
const serverPublicKeyHex = b4a.toString(keyPair.publicKey, 'hex')

const server = dht.createServer(conn => {
  console.log('got connection!')
  conn.write('Hello from the server!');
  process.stdin.pipe(conn).pipe(process.stdout)
})

app.set('view engine', 'ejs');

app.get('/', (req, res) => {
  res.render('../views/index.ejs', { serverPublicKey: serverPublicKeyHex });
});

server.listen(keyPair).then(() => {
  console.log('listening on:', b4a.toString(keyPair.publicKey, 'hex'))
})

const publicKey = b4a.toString(keyPair.publicKey, 'hex');

// Unnannounce the public key before exiting the process
// (This is not a requirement, but it helps avoid DHT pollution)
goodbye(() => server.close())


export default serverPublicKeyHex;