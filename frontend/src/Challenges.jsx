/* eslint-disable react/prop-types */
import {
    FormControl,
    ListItem,
    LinearProgress,
    ListItemText,
    Paper,
    Typography,
    Checkbox,
    Grid2,
    Button,
    Box
} from "@mui/material";
import { S3Client } from "@aws-sdk/client-s3";
import { XhrHttpHandler } from '@aws-sdk/xhr-http-handler';
import { enqueueSnackbar } from 'notistack';
import { Upload } from '@aws-sdk/lib-storage';
import { useState, useRef } from 'react';

// Challenges is a view for un-authenticated users to see all challenges.
function Challenges(props) {
    const [hideCompleted, setHideCompleted] = useState(false);
    const [uProgress, setUProgress] = useState(0)
    const [challenge, setChallenge] = useState(null)
    //var IdentityPoolId = "IDENTITY_POOL_ID";
    const bucketName = "seattle-scramble";
    const BASE_URL = "https://seattle-scramble.s3.us-west-2.amazonaws.com"
    const [s3, _] = useState(new S3Client({
        region: 'us-west-2',
        requestHandler: new XhrHttpHandler({}),
        requestChecksumCalculation: 'WHEN_REQUIRED'
    }))

    const FOUND_STAGE = 'findme'
    const CHALLENGE_STAGE = 'challenge'

    

    function handleHideCompleted(e) {
        setHideCompleted(e.target.checked)
    }

    function sanitize(input) {
        return input?.replaceAll(/\s|\\/g, "")
    }

    // async function listChallenges() {
    //     const input = {
    //         Bucket: bucketName,
    //         Prefix: `${sanitize(props.team.team_name)}/`
    //       };
    //       const command = new ListObjectsCommand(input);
    //       const response = await s3.send(command);
    //       console.log(response)
    // }

    // useEffect(() => {
    //     // 
    //     listChallenges()
    // }, [props.team])

    async function handleSubmitChallenge(file) {
        if (!challenge.id) {
            enqueueSnackbar("Invalid Challenge", { variant: "error", autoHideDuration: 3000 })
            return
        }
        try {
            let stage = challenge.found ? CHALLENGE_STAGE : FOUND_STAGE
            const upload = new Upload({
                client: s3,
                params: {
                    Bucket: bucketName,
                    Key: `${sanitize(props.team.team_name)}/${sanitize(challenge.name)}_${stage}`,
                    Body: file,
                    ContentType: 'image/jpeg'
                },
            });
            let totalProgress = 0;
            upload.on("httpUploadProgress", (progress) => {
                totalProgress = (progress.loaded / progress.total) * 100
                setUProgress(totalProgress.toFixed(2))
            });
            await upload.done();
    
            await props.postEndpoint("/challenge/", JSON.stringify({
                id: challenge.id,
            }))
            await props.fetchEndpoint("/challenges/")
            await props.fetchEndpoint("/team/")
            await props.fetchEndpoint("/team/challenges/")
        } catch(err) {
            if (err instanceof Error && err.name === "AbortError") {
                enqueueSnackbar(`Multipart upload was aborted. ${err.message}`, { variant: "error", autoHideDuration: 3000 })
                console.error(`Multipart upload was aborted. ${err.message}`);
              } else {
                enqueueSnackbar(`Error uploading image: ${err}`, { variant: "error", autoHideDuration: 3000 })
                console.error(`Error uploading image: ${err}`);
              }
        }
        setUProgress(0);

    }

    async function handleUploadClick(event) {
        const files = event.target.files;
        if (!files || files.length === 0) {
            enqueueSnackbar("No file selected", { variant: "error", autoHideDuration: 3000 })
            return; // No file selected, do nothing
        }
        let text = `Are you sure you want to sumit this photo?`
        // if (!window.confirm(text)) {
        //     enqueueSnackbar("Upload canceled", { variant: "warning", autoHideDuration: 3000 })
        //     return
        // }
        let file = files[0]
        if ((file.size / 1024 / 1024) > 200) {
            enqueueSnackbar("File size must be < 200MiB", { variant: "error", autoHideDuration: 3000 })
            return
        }
        handleSubmitChallenge(file)
    }

    const fileInput = useRef();

    // getChallenge returns a challenge's state given its id.
    function getChallenge(id) {
        return props.teamChallenges.find(c=>c.challenge_id===id)
    }

    return (
        <>
            <Box sx={{ my: 1, display: 'flex', justifyContent: 'space-between' }} alignItems={"center"}>
                <Typography variant="body-1" sx={{ p: 0, color: 'text.secondary' }}>Challenges</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'row'  }} alignItems={"center"}>
                    <Typography variant="body-1" sx={{ p: 0, color: 'text.secondary' }}>Hide Completed</Typography>
                    <Checkbox sx={{ pl: 1, pb: 0 }} checked={hideCompleted} onChange={handleHideCompleted} />
                </Box>
            </Box>
            <Grid2 container direction="row" spacing={2}>
                {props.challenges.map((item) => (
                    <>
                        {hideCompleted && getChallenge(item.id)?.completed ?
                            (<></>)
                            : (
                                <Grid2 size={{ xs: 12, md: 6 }}>
                                    <Paper elevation={props.elevation}>
                                        <FormControl aria-label="Challenge selection" sx={{ width: "100%" }}>
                                            {challenge && 
                                            item.name === challenge.name && 
                                            uProgress > 0 &&
                                            <LinearProgress variant="determinate" value={uProgress} />}
                                            <Box sx={{ position: 'relative' }}>
                                                {getChallenge(item.id)?.found && (
                                                    <Typography sx={{ position: 'absolute', top: 0, left: 20 }}>✅</Typography>
                                                    )}
                                                    {getChallenge(item.id)?.completed && (
                                                    <Typography sx={{ position: 'absolute', top: 0 }}>✅</Typography>
                                                    )}
                                            </Box>
                                            <Grid2 container direction="row">
                                                <Grid2 item size={{ xs: 12, md: 6 }} sx={{ p: 1 }}>
                                                    <ListItem key={`chal-${item.name}`}>
                                                        {getChallenge(item.id)?.found ? (
                                                            <ListItemText primary={`${item.name}`} secondary={`${item.description} (${item.points} Points)`} />
                                                        )
                                                            : (
                                                                <ListItemText primary={`${item.name}`} secondary={"This challenge will be revealed on site visit."} />
                                                            )}
                                                    </ListItem>
                                                </Grid2>
                                                <Grid2 sx={{ p: 1 }} display={"flex"} justifyContent={"center"} item size={{ xs: 12, md: 12 }}>
                                                    <Button sx={{ width: 1 }} onClick={() => props.handleShow(`${BASE_URL}/challenges/${sanitize(item.name)}.jpg`)} variant="outlined">View</Button>
                                                </Grid2>
                                                {getChallenge(item.id)?.completed ? (
                                                        <Grid2 sx={{ p: 1 }} display={"flex"} justifyContent={"center"} item size={{ xs: 12, md: 12 }}>
                                                            <Button sx={{ width: 1, mr:1 }}
                                                                onClick={() => props.handleShow(`${BASE_URL}/${sanitize(props.team.team_name)}/${sanitize(item.name)}_${FOUND_STAGE}`)}
                                                                variant="outlined"
                                                                type="submit">View Submission
                                                            </Button>
                                                            <Button sx={{ width: 1, ml:1 }}
                                                                onClick={() => props.handleShow(`${BASE_URL}/${sanitize(props.team.team_name)}/${sanitize(item.name)}_${CHALLENGE_STAGE}`)}
                                                                variant="outlined"
                                                                type="submit">View Challenge Submission
                                                            </Button>
                                                        </Grid2>
                                                    ) 
                                                    : (<Grid2 sx={{ p: 1 }} display={"flex"} justifyContent={"center"} item size={{ xs: 12, md: 12 }}>
                                                        <Button sx={{ width: 1 }}
                                                            onClick={() => { setChallenge(item);fileInput.current?.click() }}
                                                            variant="outlined"
                                                            type="submit">Submit {getChallenge(item.id)?.found ? "Challenge" : "Location"}
                                                        </Button>
                                                        <input
                                                            ref={fileInput}
                                                            type="file"
                                                            accept="image/*"
                                                            onChange={(e) => handleUploadClick(e, item)}
                                                            style={{ display: 'none' }}
                                                        />
                                                    </Grid2>
                                                    )
                                                }
                                            </Grid2>

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