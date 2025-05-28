import axios from 'axios';
import React, { createContext } from 'react'

const AuthContext = createContext();
const AuthContextProvider = ({children}) => {
    axios.defaults.withCredentials = true;
    return (
      <AuthContext.Provider value={{}}>
        {children}
      </AuthContext.Provider>
    )
}

const useAuth = () => useContext(AuthContext);
export { useAuth, AuthContextProvider  };