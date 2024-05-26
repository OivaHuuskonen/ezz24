import { useState, createContext, useContext, useEffect } from "react";
import axios from "axios";

/*const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({
    user: null,
    token: "",
  });

  useEffect(() => {
    const data = localStorage.getItem("auth");
    if (data) {
      const parsed = JSON.parse(data);
      setAuth({ ...auth, user: parsed.user, token: parsed.token });

    // axios config
    axios.defaults.baseURL = process.env.REACT_APP_API;
    axios.defaults.headers.common["Authorization"] = parsed.token;
  }
}, []);

  return (
    <AuthContext.Provider value={[auth, setAuth]}>
      {children}
    </AuthContext.Provider>
  );
};*/
const AuthContext = createContext();
//const useAuth = () => useContext(AuthContext);

const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({
    user: null,
    token: "",
  });

    // axios config
  
 axios.defaults.baseURL = process.env.REACT_APP_API;
axios.defaults.headers.common["Authorization"] = auth?.token;
     
  //Voit tarkistaa, että auth.token -tila päivitetään oikein AuthProvider -komponentissa 
  //lisäämällä console.log -lauseen sen arvon tarkastamiseksi. AuthProvider -komponentti vastaa tilan 
  //päivittämisestä ja välittämisestä alikomponenteille, joten sen sisällä voi tarkistaa, 
  //että tila päivittyy oikein.

  useEffect(() => {
    const data = localStorage.getItem("auth");
    if (data) {
      const parsed = JSON.parse(data);
      setAuth({ ...auth, user: parsed.user, token: parsed.token });
      axios.defaults.headers.common["Authorization"] = `Bearer ${parsed.token}`; // ???? Aseta oletus Authorization-otsake axios-asetuksiin
      console.log("Auth token updated:", parsed.token); //Tarkista, että auth.token -tila päivitetään oikein
      console.log("Axios Authorization header:", axios.defaults.headers.common["Authorization"]); // Tarkista, että Authorization-otsake asetetaan oikein
    }
  }, []);

  return (
    <AuthContext.Provider value={[auth, setAuth]}>
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => useContext(AuthContext);

export { useAuth, AuthProvider };