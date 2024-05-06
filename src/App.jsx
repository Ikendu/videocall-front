import { Route, Routes } from "react-router-dom";
import "./App.css";
import LifeChat from "./screens/LifeChat";
import Room from "./screens/Room";

function App() {
  return (
    <>
      <div>
        <Routes>
          <Route index element={<LifeChat />} />
          <Route path="/room/:roomID" element={<Room />} />
        </Routes>
      </div>
    </>
  );
}

export default App;
