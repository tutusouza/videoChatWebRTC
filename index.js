let peer = new Peer();
var conn = null
let meuID = null;
let amigo = null;

const siteTitle = document.getElementById('siteTitle');
const idAmigo = document.getElementById('id_amigo');
const inputMensagem = document.getElementById('enviaMensagem');
const containerDeMensagens = document.getElementById('container-mensagens');
const containerIdAmigo = document.getElementById('containerIdAmigo');
const contentVideo = document.getElementById('content-video');
const meuVideo = document.getElementById('meuVideo');
const constraints = { audio: true, video: { width: 1280, height: 720 } }; 

peer.on('open', function(id) {  
     
    siteTitle.innerText = `Video Chat - Seu ID: ${id}`;
    meuID = id;
    console.log('My peer ID is: ' + id);
});

peer.on('connection', function(Conn) { //quando se conectam a mim
    Conn.on('open', function() {
        console.log('alguem se conectou a mim');
        containerIdAmigo.innerHTML = `
            <h2>Um usuario se conectou!</h2>
        `
        contentVideo.style.visibility='visible'
        conn = Conn
        // Receive messages
        conn.on('data', function(data) {
            inserindoMensagem('ele', data);
        	console.log('recebido: ', data);
        });
        
        // // Send messages
        // conn.send('Hello from markers-page!');
    });
});

peer.on('call', (call) => {
    console.log('Chamada de video solicitada.')
    if (hasGetUserMedia()) {   
        navigator.mediaDevices.getUserMedia(constraints)
        .then(
            function(mediaStream) {
                containerDeMensagens.style.visibility = "hidden";            
                meuVideo.style.visibility = "visible";       
                call.answer(mediaStream); // Answer the call with an A/V stream.
                call.on('stream', (remoteStream) => {
                    console.log('recebeu video')
                    meuVideo.srcObject = remoteStream;
                });
            }
        )
        .catch(
            function(err) { 
                console.log(err.name + ": " + err.message); 
            }
        );
    } else {
        alert('getUserMedia() is not supported in your browser');
    }   
});

function conectar() {
    try {
        if(!idAmigo.value)
            return alert("Digite o id do parceiro.")
        amigo = idAmigo.value.trim()
        let connTemp = peer.connect(idAmigo.value.trim());        
        
        connTemp.on('open', function() {
            // Receive messages
            conn = connTemp
			connTemp.on('data', function(data) {
                inserindoMensagem('ele', data);
				console.log('Received', data);
			});
			
            // Send messages
            contentVideo.style.visibility='visible'
            containerIdAmigo.innerHTML = `
                <h2>Conexão realizada!</h2>
            `
			// connTemp.send('Hello from phone!');
		});	

    } catch (error) {
        console.log('erro ao conectar',error)
        debugger
    }
};

function inserindoMensagem(remetente, mensagem) {
    let htmlMensagem
    var el = document.createElement( 'div' );
    if(remetente == 'eu'){
        htmlMensagem = `
            <div class="meunsagem-div-eu">
                <span>${mensagem}</span>
            </div>
        `
    }else{
        htmlMensagem = `
            <div class="meunsagem-div-ele">
                <span>${mensagem}</span>
            </div>
        `
    }
    el.innerHTML = htmlMensagem
    containerDeMensagens.append(el)
};

function enviarMensagem() {
    try {
        if(!inputMensagem.value)
            return alert('Digite o texto da mensagem')
        inserindoMensagem('eu', inputMensagem.value)
        conn.send(inputMensagem.value);        
        inputMensagem.value = ""
    } catch (error) {
        console.log('erro ao enviar mensagem', error)
    }
};

function chamadaVideo() {    
    if (hasGetUserMedia()) {   
        navigator.mediaDevices.getUserMedia(constraints)
        .then(
            function(mediaStream) {
                containerDeMensagens.style.visibility = "hidden";            
                meuVideo.style.visibility = "visible";  

                debugger
                const call = peer.call(amigo, mediaStream);
                call.on('stream', (remoteStream) => {
                    meuVideo.srcObject = remoteStream;
                });

                meuVideo.onloadedmetadata = manupulaVideo
            }
        )
        .catch(
            function(err) { 
                console.log(err.name + ": " + err.message); 
            }
        );
    } else {
    alert('getUserMedia() is not supported in your browser');
    }   
};

function hasGetUserMedia() {
    // Note: Opera builds are unprefixed.
    return !!(navigator.getUserMedia || navigator.webkitGetUserMedia ||
              navigator.mozGetUserMedia || navigator.msGetUserMedia);
};
  
function manupulaVideo(e){
    // Faz algo com o vídeo aqui.
};

function enter() {
    var key = window.event.keyCode;

    // If the user has pressed enter
    if (key === 13) {
        enviarMensagem();
        return false;
    }
    else {
        return true;
    }
};