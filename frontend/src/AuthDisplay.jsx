/* eslint-disable react/prop-types */
import {
  Grid2,
  FormControl,
  Paper,
  Button,
  Autocomplete,
  TextField,
  Typography,
  Tab,
  Tabs,
  Box,
  Stack,
  ListItem,
  ListItemText,
  Switch
} from "@mui/material";
import { enqueueSnackbar } from 'notistack';
import { useEffect, useState } from 'react';

function AuthDisplay(props) {

  // Auth Required Fields - are these needed / wanted?
  const [team, setTeam] = useState({})


  // Challenge form related info
  const [selectedChallenge, setSelectedChallenge] = useState("")


  async function handleSubmitChallenge() {
    if (!props.canton.id) {
      enqueueSnackbar("Canton not specified", { variant: "error", autoHideDuration: 3000 })
      return
    }
    if (!selectedChallenge) {
      enqueueSnackbar("Challenge not specified", { variant: "error", autoHideDuration: 3000 })
      return
    }
    let text = `Are you sure you want to submit "${selectedChallenge.name}"?`
    if (!window.confirm(text)) {
      setSelectedChallenge("")
      return
    }
    await props.postEndpoint("/challenge/", JSON.stringify({
      id: selectedChallenge.id,
      canton: props.canton.id,
    }))
    setSelectedChallenge("")
    await props.setUpdateEvents(selectedChallenge.id)
    await props.fetchEndpoint("/cantons/")
  }



  // Fetch all data on map load.
  useEffect(() => {
    fetchEndpoint("/team/")
    fetchEndpoint("/teams/")
  }, [props.updateEvents]);

  // fetchEndpoint grabs data from and endpoint and handles its result by
  // storing it in specific frontend state.
  async function fetchEndpoint(endpoint) {
    let authHeaders = {
      headers: new Headers({
        'Authorization': `Bearer ${props.auth}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      })
    }
    return new Promise((resolve) => {
      fetch(props.backend + endpoint, authHeaders)
        .then((response) => {
          return response.json()
        })
        .then((data) => {
          if (!data) return;
          switch (endpoint) {
            case "/team/":
              setTeam(data)
              console.log(data)
              break;
            case "/teams/":
              console.log(data)
              break;
            default:
              console.log(`warning: no endpoint handler available for ${endpoint}`)
              break;
          }
        })
        .catch((err) => {
          resolve(err) // This application is not robust enough to handle rejection.
        });
    })
  }

  return (
    <>
      <Box sx={{ width: '100%' }}>
      </Box>
    </>
  )
}

export default AuthDisplay;
