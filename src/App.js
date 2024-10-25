import { useEffect } from "react";
import axios from "axios";
import Login from "./components/Login";

function App() {
  useEffect(() => {
    axios
      .get("http://localhost:3001/")
      .then((res) => {
        console.log(res.data); // Should log: "Backend is connected!"
      })
      .catch((err) => console.error("Error connecting to backend:", err));
  }, []);

  return (
    <div>
      <Login />
    </div>
  );
}

export default App;
