/* eslint-disable react/prop-types */
import {
    Input,
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
    const foundColor = "oklch(0.84 0.0987 120.57)"
    const completedColor = "oklch(0.68 0.0987 120.57)"

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

    async function uploadImage(file) {
        return new Promise((resolve, reject) => {
            // Create a root reference
            const storage = getStorage(app);

            // Create file metadata including the content type
            /** @type {any} */
            const metadata = {
                customMetadata: {
                    question: file.question,
                    points: file.points
                }
            };

            if (completedChallenges.includes(file.question)) {
                let q = file.question.length > 80 ? (file.question.substring(0, 80) + "...") : file.question;
                let text = `Are you sure you want to overwrite your submission for "${q}"?`
                if (!window.confirm(text)) {
                    enqueueSnackbar("⚠️ File upload canceled")
                    return
                }
            }

            if ((file.size / 1024 / 1024) > 20) {
                enqueueSnackbar("⚠️ File size must be < 20MiB")
                return
            }
            //const storageRef = ref(storage, (phone + '/' + file.name));
            //const uploadTask = uploadBytesResumable(storageRef, file, metadata);

            // Listen for state changes, errors, and completion of the upload.
            uploadTask.on('state_changed',
                (snapshot) => {
                    // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded.
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;

                    switch (snapshot.state) {
                        case 'paused':
                            console.log('Upload is paused');
                            break;
                        case 'running':
                            // let relProgress = progress / ((1 / files.length))
                            // let totalProgress = (uProgress + relProgress)
                            // setUProgress(totalProgress)
                            // setDialog(`Upload ${totalProgress.toFixed(2)}% Complete`)
                            // setUVariant("info")
                            break;
                        default:
                            console.log('Unknown upload state: ' + snapshot.state)
                            break;
                    }
                },
                (error) => {
                    // A full list of error codes is available at
                    // https://firebase.google.com/docs/storage/web/handle-errors
                    console.error(`error: ${error.code} ${error.message}`)
                    // setDialog("Failed to upload submission")
                    // setUVariant("error")
                    // setIsUploading(true);
                    resolve();
                    return

                },
                () => {

                    resolve();
                }
            );
        })
    }

    async function handleUploadClick(e) {
        await fileInput.current.click()
        let text = `Are you sure you want to sumit this photo?`
        if (!window.confirm(text)) {
          return
        }
    }

    const fileInput = useRef();

    return (
        <>
            <Grid2 spacing={0} container direction="row">
                <ListSubheader id="challenges-title">Challenges</ListSubheader>
                <ListSubheader id="challenges-title">Hide Completed?</ListSubheader>
                <Checkbox checked={hideCompleted} onChange={handleHideCompleted} />
            </Grid2>
            <Grid2 container direction="row" spacing={2}>
                {props.challenges.map((item) => (
                    <>
                        {hideCompleted && item.completed ?
                            (<></>)
                            : (
                                <Grid2 size={{ xs: 12, md: 6 }}>
                                    <Paper sx={{ my: 1 }} elevation={props.elevation}>
                                        <FormControl aria-label="Challenge selection" sx={{ width: "100%" }}>
                                            <List sx={{ p: 0 }}>
                                                <Grid2 container direction="row">
                                                    <Grid2 item size={{ xs: 12, md: 6 }} sx={{ p: 1 }}>
                                                        <ListItem key={`chal-${item.name}`}>
                                                            {item.found ? (
                                                                <ListItemText primary={`${item.name}`} secondary={`${item.description} (${item.points} Points)`} />
                                                            )
                                                                : (
                                                                    <ListItemText primary={`${item.name}`} secondary={"This challenge will be revealed on site visit."} />
                                                                )}
                                                        </ListItem>
                                                    </Grid2>
                                                    <Grid2 sx={{ p: 1 }} display={"flex"} justifyContent={"center"} item size={{ xs: 12, md: 3 }}>
                                                        <Button sx={{ width: 1 }} onClick={() => props.handleShow(item.url)} variant="outlined">View</Button>
                                                    </Grid2>
                                                    {!item.completed &&
                                                        <Grid2 sx={{ p: 1 }} display={"flex"} justifyContent={"center"} item size={{ xs: 12, md: 3 }}>
                                                            <Button sx={{ width: 1 }} onClick={handleUploadClick} variant="outlined" type="submit">Submit {item.found ? "Challenge" : "Location"}</Button>
                                                            <input
                                                                ref={fileInput}
                                                                type="file"
                                                                accept="image/*"
                                                                style={{ display: 'none' }}
                                                            />
                                                        </Grid2>
                                                    }
                                                    <Grid2 item size={{ xs: 12 }}>
                                                        {
                                                            item.found && (<div style={{ backgroundColor: foundColor }}><Typography variant="h6" component="div" align="center" sx={{ color: 'text.secondary' }}>Found</Typography></div>)
                                                        }

                                                    </Grid2>
                                                    <Grid2 item size={{ xs: 12 }}>
                                                        {
                                                            item.completed && (<div style={{ backgroundColor: completedColor }}><Typography variant="h6" component="div" align="center" sx={{ color: 'text.secondary' }}>Completed</Typography></div>)
                                                        }
                                                    </Grid2>
                                                </Grid2>
                                            </List>
                                        </FormControl>
                                    </Paper>
                                </Grid2>
                            )
                        }
                    </>
                ))}
            </Grid2>
        </>
    )
}

export default Challenges