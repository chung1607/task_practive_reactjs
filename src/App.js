import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:3000");

function App() {
  const [message, setMessage] = useState("");
  const [room, setRoom] = useState("");
  const [messages, setMessages] = useState([]);
  const [myId, setMyId] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    socket.on("connect", () => {
      setMyId(socket.id);
      console.log("Connected:", socket.id);
    });

    socket.on("roomMessage", (data) => {
      setMessages((prev) => [...prev, data]);
    });

    socket.on("system", (data) => {
      setMessages((prev) => [
        ...prev,
        { system: true, message: data.message },
      ]);
    });

    return () => {
      socket.off("roomMessage");
      socket.off("system");
    };
  }, []);

  // auto scroll xuống cuối
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const joinRoom = () => {
    socket.emit("joinRoom", room);
  };

  const sendMessage = () => {
    if (!message.trim()) return;

    socket.emit("roomMessage", {
      room,
      message,
    });

    setMessage("");
  };

  return (
    <div style={styles.container}>
      <h2>💬 Mini Chat</h2>

      {/* Join room */}
      <div style={styles.row}>
        <input
          style={styles.input}
          placeholder="Room name"
          value={room}
          onChange={(e) => setRoom(e.target.value)}
        />
        <button style={styles.button} onClick={joinRoom}>
          Join
        </button>
      </div>

      {/* Chat box */}
      <div style={styles.chatBox}>
        {messages.map((msg, index) => {
          if (msg.system) {
            return (
              <div key={index} style={styles.systemMsg}>
                {msg.message}
              </div>
            );
          }

          const isMe = msg.clientId === myId;

          return (
            <div
              key={index}
              style={{
                ...styles.messageRow,
                justifyContent: isMe ? "flex-end" : "flex-start",
              }}
            >
              <div
                style={{
                  ...styles.bubble,
                  backgroundColor: isMe ? "#0084ff" : "#e4e6eb",
                  color: isMe ? "#fff" : "#000",
                }}
              >
                {msg.message}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div style={styles.row}>
        <input
          style={styles.input}
          placeholder="Type message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button style={styles.button} onClick={sendMessage}>
          Send
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: 500,
    margin: "20px auto",
    fontFamily: "Arial",
  },
  row: {
    display: "flex",
    gap: 10,
    marginBottom: 10,
  },
  input: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    border: "1px solid #ccc",
  },
  button: {
    padding: "10px 15px",
    borderRadius: 8,
    border: "none",
    background: "#0084ff",
    color: "#fff",
    cursor: "pointer",
  },
  chatBox: {
    height: 400,
    border: "1px solid #ccc",
    borderRadius: 10,
    padding: 10,
    overflowY: "auto",
    marginBottom: 10,
    background: "#f0f2f5",
  },
  messageRow: {
    display: "flex",
    marginBottom: 8,
  },
  bubble: {
    padding: "10px 14px",
    borderRadius: 20,
    maxWidth: "70%",
    wordBreak: "break-word",
  },
  systemMsg: {
    textAlign: "center",
    fontSize: 12,
    color: "#666",
    margin: "5px 0",
  },
};

export default App;