import { useCallback, useEffect, useState } from "react";
import { useSocket } from "../context/SocketProvider";
import ReactPlayer from "react-player";
import peer from "../service/peer";

function Room() {
  const socket = useSocket();
  const [remoteSocketId, setRemoteSocketId] = useState(null);
  const [myStream, setMyStream] = useState();
  const [remoteStream, setRemoteStream] = useState();
  const [muteVoice, setMuteVoice] = useState("mute");

  const handleUserJoined = useCallback(({ email, id }) => {
    console.log(`${email} joined the room`);
    setRemoteSocketId(id);
  }, []);

  const handleCallUser = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
    setMyStream(stream);
    const offer = await peer.getOffer();
    socket.emit("user:call", { to: remoteSocketId, offer });
  }, [remoteSocketId, socket]);

  const handleIncomingCall = useCallback(
    async ({ from, offer }) => {
      setRemoteSocketId(from);
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      setMyStream(stream);
      console.log("Incoming Call", from, offer);
      const ans = await peer.getAnswer(offer);
      socket.emit("call:accepted", { to: from, ans });
    },
    [socket]
  );

  const sendStream = useCallback(() => {
    for (const track of myStream.getTracks()) {
      peer.peer.addTrack(track, myStream);
    }
  }, [myStream]);

  const handleCallAccepted = useCallback(
    ({ from, ans }) => {
      peer.setLocalDescription(ans);
      console.log("Call Accepted", from, ans);
      sendStream();
    },
    [sendStream]
  );

  const handleNegoNeeded = useCallback(async () => {
    const offer = await peer.getOffer();
    socket.emit("peer:nego:needed", { offer, to: remoteSocketId });
  }, [remoteSocketId, socket]);

  const handleNegoIncoming = useCallback(
    async ({ from, offer }) => {
      const ans = await peer.getAnswer(offer);
      socket.emit("peer:nego:done", { to: from, ans });
    },
    [socket]
  );

  const handleNegoFinal = useCallback(async ({ ans }) => {
    await peer.setLocalDescription(ans);
  }, []);

  useEffect(() => {
    peer.peer.addEventListener("track", async (e) => {
      const remoteStream = e.streams;
      console.log("GOT TRACKS");
      setRemoteStream(remoteStream[0]);
    });
  }, []);

  useEffect(() => {
    peer.peer.addEventListener("negotiationneeded", handleNegoNeeded);
    return () => {
      peer.peer.removeEventListener("negotiationneeded", handleNegoNeeded);
    };
  }, [handleNegoNeeded]);

  useEffect(() => {
    socket.on("user:joined", handleUserJoined);
    socket.on("incoming:call", handleIncomingCall);
    socket.on("call:accepted", handleCallAccepted);
    socket.on("peer:nego:needed", handleNegoIncoming);
    socket.on("peer:nego:final", handleNegoFinal);
    return () => {
      socket.off("user:joined", handleUserJoined);
      socket.off("incoming:call", handleIncomingCall);
      socket.off("call:accepted", handleCallAccepted);
      socket.off("peer:nego:needed", handleNegoIncoming);
      socket.off("peer:nego:final", handleNegoFinal);
    };
  }, [
    handleCallAccepted,
    handleIncomingCall,
    handleNegoFinal,
    handleNegoIncoming,
    handleUserJoined,
    socket,
  ]);

  return (
    <div>
      <h1>Chat Room</h1>
      <h3>{remoteSocketId ? "Connected" : "No one in the room"}</h3>

      {myStream && <button onClick={sendStream}>Anwser call</button>}
      {remoteSocketId && <button onClick={handleCallUser}>Call</button>}
      {myStream && (
        <div>
          <h2>My Stream</h2>
          <ReactPlayer url={myStream} width="220px" height="130px" playing />
        </div>
      )}
      {remoteStream && (
        <div>
          <h2>Remote Stream</h2>
          <ReactPlayer
            url={remoteStream}
            width="700px"
            height="350px"
            playing
          />
        </div>
      )}
    </div>
  );
}
export default Room;
