import React from 'react';
import './App.css';
import Router from './router/router';
import Footer from './Component/footer/Footer';
import Header from './Component/header/Header';
import { AppContextProvider } from './Context/AppContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { LoadingProvider } from './Context/LoadingContext';
import LoadingSpinner from './Utils/LoadingSpinner';

function App() {
  
  return (
    <LoadingProvider>
      <div className="App">
        <Header />
        <ToastContainer
        position="top-center" // Position it in the center of the screen
        autoClose={false} // Disable auto-close
        hideProgressBar={true}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss={false}
        draggable={false}
        pauseOnHover={false}
        theme="light"
        style={{ position: "absolute",
        top: "50%",
        left: "50%",
      padding: "0px",}}
      />
        <LoadingSpinner />
        <div className="body">
          <AppContextProvider>
            <Router />
          </AppContextProvider>
        </div>
        <Footer />
      </div>
    </LoadingProvider>
  );
}

export default App;
