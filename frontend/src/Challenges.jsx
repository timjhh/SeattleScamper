/* eslint-disable react/prop-types */
import {
    FormControl,
    ListItem,
    ListSubheader,
    ListItemText,
    Paper,
    List,
    Typography,
    Checkbox,
    Grid2,
    Button
} from "@mui/material";
import { enqueueSnackbar } from 'notistack';
import { useEffect, useState, useRef } from 'react';

// Challenges is a view for un-authenticated users to see all challenges.
function Challenges(props) {

    const [hideCompleted, setHideCompleted] = useState(false);

    function handleHideCompleted(e) {
        setHideCompleted(e.target.checked)
    }

    async function handleSubmitChallenge(c) {
        console.log(c)
        if (!c.id) {
            enqueueSnackbar("Invalid Challenge", { variant: "error", autoHideDuration: 3000 })
            return
        }
        await props.postEndpoint("/challenge/", JSON.stringify({
            id: c.id,
        }))
        await props.fetchEndpoint("/challenges/")

        // if (eventMessage.length === 0) {
        //     enqueueSnackbar("Cannot send empty message", { variant: "error", autoHideDuration: 3000 })
        //     return
        // }
        // await props.postEndpoint("/event/", JSON.stringify({
        //     text: eventMessage,
        // }))
        // setEventMessage("")
    }

    return (
        <>
            <Grid2 spacing={0} container direction="row">
                <ListSubheader id="challenges-title">Challenges</ListSubheader>
                <ListSubheader id="challenges-title">Hide Completed?</ListSubheader>
                <Checkbox checked={hideCompleted} onChange={handleHideCompleted} />
            </Grid2>
            {props.challenges.map((item) => (
                <>
                    {hideCompleted && item.completed ?
                        (<></>)
                        : (
                            <Paper sx={{ my: 1, p:1 }} elevation={props.elevation}>
                                <FormControl aria-label="Challenge selection" sx={{ width: "100%" }}>
                                    <List>
                                        <Grid2 container direction="row">
                                            <Grid2 item size={{ xs: 12, md: 6 }}>
                                                <ListItem key={`chal-${item.name}`} {...props}>
                                                    {item.found ? (
                                                        <ListItemText primary={`${item.name}`} secondary={`${item.description} (${item.points} Points)`} />
                                                    )
                                                        : (
                                                            <ListItemText primary={`${item.name}`} secondary={"This challenge will be revealed on site visit."} />
                                                        )}
                                                </ListItem>
                                            </Grid2>
                                            <Grid2 display={"flex"} justifyContent={"center"} item size={{ xs: 6, md: 6 }}>
                                                    <Button variant="outlined">View</Button>
                                            </Grid2>
                                            <Grid2 display={"flex"} justifyContent={"center"} item size={{ xs: 6, md: 6 }}>
                                                <Button variant="outlined" onClick={() => handleSubmitChallenge(item)} type="submit">Submit Photo</Button>
                                            </Grid2>
                                            <Grid2 item size={{ xs: 6, md: 3 }}>
                                                {
                                                    item.found && (<Typography variant="h5" component="div" align="center">✅ Found</Typography>)
                                                }

                                            </Grid2>
                                            <Grid2 item size={{ xs: 6, md: 3 }}>

                                                {
                                                    item.completed && (<Typography variant="h5" component="div" align="center">✅ Completed</Typography>)
                                                }
                                            </Grid2>
                                        </Grid2>
                                    </List>
                                </FormControl>
                            </Paper>
                        )
                    }
                </>
            ))}
        </>
    )
}

export default Challenges