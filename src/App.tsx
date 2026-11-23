import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { store } from "./app/store";
import AppRoutes from "./routes/AppRoutes";
import ErrorBoundary from "./components/ErrorBoundary";
import WebSocketListener from "./features/notifications/WebSocketListener";
import "./styles/global.css";

function App() {
  return (
    <ErrorBoundary>
      <Provider store={store}>
        <WebSocketListener />
        <AuthProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </AuthProvider>
      </Provider>
    </ErrorBoundary>
  );
}

export default App;