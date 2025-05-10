import Game from './Game.jsx'
import Login from './Login.jsx'
import {
  AppBar,
  Button,
  Toolbar,
  Typography
} from "@mui/material";
import './App.css'
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useEffect, useState } from 'react';
import { blue, grey } from '@mui/material/colors';
import { BrowserRouter as Router, Routes, Route, NavLink } from "react-router";
import Cookies from 'js-cookie'

const theme = createTheme({
  // typography: {
  //   fontFamily: "Helvetica"
  // },
  palette: {
    primary: blue,
    secondary: {
      main: grey[100],
    }
  },
});

function App() {
  const backend = import.meta.env.VITE_BACKEND_URL
  const [auth, setAuth] = useState(Cookies.get('authCookie'))

  function logout() {
    setAuth(null)
    Cookies.remove('authCookie')
  }

  return (
    <Router>
      <Routes>
        <Route path='/' element={
          <ThemeProvider theme={theme}>
              <AppBar position="fied">
                <Toolbar>
                  <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                    Seattle Scramble
                  </Typography>
                  {auth == null ? (<NavLink style={{ color: "white" }} to='/login'><Button color="inherit">Log In</Button></NavLink>) : <Button onClick={logout} color="inherit">Log Out</Button>}
                </Toolbar>
              </AppBar>
                  <ThemeProvider theme={theme}>
                    <Game
                      auth={auth}
                      backend={backend}
                    />
                  </ThemeProvider>
          </ThemeProvider>
        } />
        <Route path='/login' element={
          <ThemeProvider theme={theme}>
            <Login setAuth={setAuth} backend={backend} />
          </ThemeProvider>
        } />
      </Routes>
    </Router>

  )
}

export default App
