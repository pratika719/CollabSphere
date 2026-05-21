import Providers from "./app/providers.jsx";
import AppRouter from "./app/router.jsx";
import "./App.css";

function App() {
  return (
    <Providers>
      <AppRouter />
    </Providers>
  );
}

export default App;

