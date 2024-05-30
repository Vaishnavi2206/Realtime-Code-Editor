import React, { useEffect, useRef, useState } from 'react'
import Client from '../clients/Client';
import Editor from './Editor';
import { initSocket } from '../socket';
import ACTIONS from '../Actions';
import { Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';

const EditorPage = () => {

  const socketRef = useRef(null);
  const codeRef = useRef(null);
  const location = useLocation();
  const { roomId } = useParams();
  const reactNavigator = useNavigate();
  const [clients, setClients] = useState([]);

  useEffect(() => {
    console.log("called useeffect");
  
    const init = async () => {
      function handleErrors(e) {
        console.log('socket error', e);
        toast.error('Socket connection failed, try again later.');
        reactNavigator('/');
    }
      try {
        socketRef.current = await initSocket();
  
        socketRef.current.on('connect_error', handleErrors);
        socketRef.current.on('connect_failed', handleErrors);

  
        //for joining room
        socketRef.current.emit(ACTIONS.JOIN, {
          roomId,
          username: location.state?.username,
        });
  
        //listening for joined events
        socketRef.current.on(ACTIONS.JOINED, ({ clients, username, socketId }) => {
          //notify all other users except the one who has joined
          if (username !== location.state?.username) {
            toast.success(`${username} has joined the room.`);
            console.log(username)
          }
          setClients(clients);
          socketRef.current.emit(ACTIONS.SYNC_CODE, {
            code: codeRef.current,
            socketId,
        });

        });
  
        //listening for disconnected
        socketRef.current.on(ACTIONS.DISCONNECTED, ({ socketId, username }) => {
          toast.success(`${username} left the room.`);
          setClients((prev) => {
            return prev.filter((client) => client.socketId !== socketId);
          });
        });
      } catch (error) {
        handleErrors(error);
      }
    };
  
    init();
  
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current.off(ACTIONS.JOINED);
        socketRef.current.off(ACTIONS.DISCONNECTED);
      }
    };
  }, []);
  

  const copyRoomId = async ()=>{
    try{
      await navigator.clipboard.writeText(roomId);
      toast.success("Room Id has been copied to your clipboard");
    }
    catch(error){
      toast.error("Could not copy Room ID");
    }
  }

  const leaveRoom = async ()=>{
    reactNavigator('/');
  }

  const onCodeChange = (code)=>{
    codeRef.current = code
  }

    if(!location.state){
      return <Navigate to="/"/>
    }

  return (
    <div className='mainWrap'>
      <div className='aside'>
        <div className='asideInner'>
        <div className='logo'>
        <img className='logoImg' src='/code-sync.png' alt="logo"/>
        </div>
        <h3>Connected</h3>
        <div className='clientsList'>
          {
            clients.map((client)=>(
              <Client username={client.username} key={client.socketId}/>
            ))
          }
        </div>
        </div>
        <button className='btn copyBtn' onClick={copyRoomId}>Copy ROOM ID</button>
        <button className='btn leaveBtn' onClick={leaveRoom}>Leave</button>

      </div>
      <div className='editorWrap'>
        <Editor socketRef={socketRef} roomId={roomId} onCodeChange={onCodeChange}/>
      </div>

    </div>
  )
}

export default EditorPage
