import React, { useEffect, useState } from 'react';
import { randomBytes } from 'crypto';
import SimplePeer from 'simple-peer';
import Hypercore from 'hypercore';
import styles from '../styles/styles.module.css';

const ChatApp = () => {
  const [peerId, setPeerId] = useState('');
  const [message, setMessage] = useState('');
  const [chatLog, setChatLog] = useState([]);
  const [feed, setFeed] = useState(null);
  const [peer, setPeer] = useState(null);

  useEffect(() => {
    // Set up Holepunch
    const holepunch = new SimplePeer({ initiator: true, trickle: false });

    // Generate a new random key for the Hypercore feed
    const key = randomBytes(32);
    
    // Create a new instance of Hypercore with the new keyword
    const feed = new Hypercore(key, {
      valueEncoding: 'json',
    });

    holepunch.on('signal', (data) => {
      setPeerId(JSON.stringify(data)); // Set the peerId (you may need to adjust this)
    });

    holepunch.on('connect', () => {
      setPeer(holepunch);
    });

    holepunch.on('data', (data) => {
      const msg = JSON.parse(data);
      setChatLog((prevChatLog) => [...prevChatLog, msg]);
    });

    setFeed(feed);

    return () => {
      holepunch.destroy();
      feed.close();
    };
  }, []);

  const sendMessage = () => {
    if (feed && peer) {
      feed.append({ peerId, message });
      peer.send(JSON.stringify({ peerId, message }));
      setMessage('');
    }
  };

  return (
    <div>
      <h1>P2P Chat App</h1>
      <p>Your Peer ID: {peerId}</p>
      <div className={styles.chatLog}>
        {chatLog.map((msg, index) => (
          <div key={index}>
            <strong>{msg.peerId}: </strong>
            <span>{msg.message}</span>
          </div>
        ))}
      </div>
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className={styles.inputField} // Add the className here
      />
      <button onClick={sendMessage} className={styles.sendButton}>Send</button>
    </div>
  );
};

export default ChatApp;