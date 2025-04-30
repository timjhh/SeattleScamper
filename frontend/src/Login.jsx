/* eslint-disable react/prop-types */
import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormLabel from '@mui/material/FormLabel';
import FormControl from '@mui/material/FormControl';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import MuiCard from '@mui/material/Card';
import { styled } from '@mui/material/styles';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import { NavLink } from "react-router";
import { SnackbarProvider, enqueueSnackbar } from 'notistack';
import { useNavigate } from "react-router";
import Cookies from 'js-cookie'
import { useState } from 'react';


const Card = styled(MuiCard)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignSelf: 'center',
  padding: theme.spacing(2),
  gap: theme.spacing(2),
  margin: 'auto',
  
  [theme.breakpoints.up('xs')]: {
    minWidth: '80vw',
  },
  [theme.breakpoints.up('sm')]: {
    minWidth: '20vw',
  },
  boxShadow:
    'hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px',
  ...theme.applyStyles('dark', {
    boxShadow:
      'hsla(220, 30%, 5%, 0.5) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.08) 0px 15px 35px -5px',
  }),
}));

const SignInContainer = styled(Stack)(({ theme }) => ({
  height: 'calc((1 - var(--template-frame-height, 0)) * 100dvh)',
  minHeight: '100%',
  padding: theme.spacing(2),
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(4),
  },
  '&::before': {
    content: '""',
    display: 'block',
    position: 'absolute',
    zIndex: -1,
    inset: 0,
    backgroundImage:
      'radial-gradient(ellipse at 50% 50%, hsl(210, 100%, 97%), hsl(0, 0%, 100%))',
    backgroundRepeat: 'no-repeat',
    ...theme.applyStyles('dark', {
      backgroundImage:
        'radial-gradient(at 50% 50%, hsla(210, 100%, 16%, 0.5), hsl(220, 30%, 5%))',
    }),
  },
}));

export default function Login(props) {
  const [usernameError, setUsernameError] = React.useState(false);
  const [usernameErrorMessage, setUsernameErrorMessage] = React.useState('');
  const [passwordError, setPasswordError] = React.useState(false);
  const [passwordErrorMessage, setPasswordErrorMessage] = React.useState('');

  const [remember, setRemember] = useState(false)
  const handleRemember = (event) => {
    setRemember(event.target.checked);
  };

  let navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault()
    enqueueSnackbar(`Logging in...`, { variant: "info", autoHideDuration: 1000 })

    const username = document.getElementById('username');
    const password = document.getElementById('password');

    let isValid = true;

    if (!username.value) {
      setUsernameError(true);
      setUsernameErrorMessage('Please enter a valid username.');
      isValid = false;
    } else {
      setUsernameError(false);
      setUsernameErrorMessage('');
    }

    if (!password.value || password.value.length < 4) {
      setPasswordError(true);
      setPasswordErrorMessage('Password must be at least 6 characters long.');
      isValid = false;
    } else {
      setPasswordError(false);
      setPasswordErrorMessage('');
    }

    if (isValid) {
      const data = new FormData(event.currentTarget);
      data["grant_type"] = 'password'
      const params = new URLSearchParams(data)
      let response = await fetch(props.backend + "/auth/token", {
        method: 'POST',
        body: params,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        }
      })
      const resp = await response.json()
      if (response.status !== 200) {
        enqueueSnackbar(`Failed to log in: ${resp.detail}`, { variant: "error", autoHideDuration: 3000 })
        return
      }

      if(Cookies.get('authCookie')) Cookies.remove('authCookie')
      enqueueSnackbar(`Success! Redirecting...`, { variant: "success", autoHideDuration: 3000 })
      if(remember) Cookies.set('authCookie', resp.access_token)
      props.setAuth(resp.access_token)
      navigate("/")
    }
  };

  const enterLogin = (e) => {
    if (e.key === "Enter") {
      handleSubmit()
    }
  }

  return (
    <SignInContainer direction="column" display={"flex"} justifyContent="space-between" alignContent={"center"}>
      <SnackbarProvider maxSnack={3} />
      <Card variant="outlined">
        <Typography
          component="h1"
          align='center'
          variant="h4"
          sx={{ width: '100%', fontSize: 'clamp(2rem, 10vw, 2.15rem)' }}
        >
        <NavLink style={{ color: "black" }} to='/'><ArrowBackIosIcon sx={{ display: 'flex', justifyContent: 'flex-start' }} /></NavLink>
          Sign in
        </Typography>
        <Box
          component="form"
          onSubmit={handleSubmit}
          noValidate
          sx={{
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            gap: 2,
          }}
        >
          <FormControl>
            <FormLabel htmlFor="username">Username</FormLabel>
            <TextField
              error={usernameError}
              helperText={usernameErrorMessage}
              id="username"
              type="username"
              name="username"
              placeholder="username"
              autoFocus
              required
              fullWidth
              variant="outlined"
              color={usernameError ? 'error' : 'primary'}
            />
          </FormControl>
          <FormControl>
            <FormLabel htmlFor="password">Password</FormLabel>
            <TextField
              onKeyDown={enterLogin}
              error={passwordError}
              helperText={passwordErrorMessage}
              name="password"
              placeholder="••••••"
              type="password"
              id="password"
              autoComplete="current-password"
              autoFocus
              required
              fullWidth
              variant="outlined"
              color={passwordError ? 'error' : 'primary'}
            />
          </FormControl>
          <FormControlLabel
            control={<Checkbox value={remember} onClick={handleRemember} color="primary" />}
            label="Remember me"
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
          >
            Sign in
          </Button>
        </Box>
      </Card>
    </SignInContainer>
  );
}
