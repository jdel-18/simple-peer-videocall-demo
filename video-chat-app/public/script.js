const socket = io();

let localStream;
let localPeer;
let remotePeer;

// Get access to user's camera and microphone
navigator.mediaDevices.getUserMedia({ video: true, audio: true })
  .then(stream => {
    localStream = stream;
    document.getElementById('localVideo').srcObject = localStream;

    socket.emit('join', 'room123'); // Replace 'room123' with your desired room ID
    socket.on('offer', offer => {
      localPeer = new SimplePeer({ initiator: false, trickle: false });
      localPeer.signal(offer);

      localPeer.on('signal', data => {
        socket.emit('answer', data);
      });

      localPeer.on('stream', remoteStream => {
        document.getElementById('remoteVideo').srcObject = remoteStream;
      });
    });
  })
  .catch(error => {
    console.error('Error accessing camera and microphone:', error);
  });

socket.on('receiveChat', message => {
  const chatMessages = document.getElementById('chatMessages');
  const li = document.createElement('li');
  li.textContent = message;
  chatMessages.appendChild(li);
});

document.getElementById('sendButton').addEventListener('click', () => {
  const chatInput = document.getElementById('chatInput');
  const message = chatInput.value;
  if (message.trim() !== '') {
    socket.emit('sendChat', message);
    chatInput.value = '';
  }
});
