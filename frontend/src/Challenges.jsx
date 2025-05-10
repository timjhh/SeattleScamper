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
    Button,
    Box
} from "@mui/material";
import AWS from "aws-sdk";
import { S3Client, ListBucketsCommand, PutObjectCommand, ListObjectsCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { enqueueSnackbar } from 'notistack';
import { useEffect, useState, useRef } from 'react';

// Challenges is a view for un-authenticated users to see all challenges.
function Challenges(props) {

    const [hideCompleted, setHideCompleted] = useState(false);

    function handleHideCompleted(e) {
        setHideCompleted(e.target.checked)
    }

    async function handleSubmitChallenge(file) {
        console.log(file.challenge)
        console.log(file)
        let c = file.challenge
        if (!c.id) {
            enqueueSnackbar("Invalid Challenge", { variant: "error", autoHideDuration: 3000 })
            return
        }


        var bucketName = "seattle-scramble";
        var region = "us-west-2";
        //var IdentityPoolId = "IDENTITY_POOL_ID";


        var s3 = new S3Client({
        //apiVersion: "2006-03-01",
        region: region,

        requestChecksumCalculation: 'WHEN_REQUIRED'
        });

        // console.log(c)
        let cmd = new PutObjectCommand({
                Bucket: bucketName,
                Key: `folder/${file.name}`,
                Body: file,
        });

        // const url = await getSignedUrl(s3, cmd, { expiresIn: 3600 });
        // console.log(url)

        // Put an object into an Amazon S3 bucket.
        let res = await s3.send(cmd);
        console.log(res)

        // await props.postEndpoint("/challenge/", JSON.stringify({
        //     id: c.id,
        // }))


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

    useEffect(() => {

    }, [])

    async function handleUploadClick(challenge) {
        await fileInput.current.click()
        console.log(fileInput.current.files)
        // let text = `Are you sure you want to sumit this photo?`
        // if (!window.confirm(text)) {
        //   return
        // }
        // if ((file.size / 1024 / 1024) > 20) {
        //     enqueueSnackbar("⚠️ File size must be < 20MiB")
        //     return
        // }
        fileInput.current.addEventListener('click', () => {
            if(fileInput.current.files.length == 0) {
                return
            }
            let file = fileInput.current.files[0];
            file.challenge = challenge;
            handleSubmitChallenge(file)
        })

    }

    const fileInput = useRef();

    return (
        <>
            {/* <Grid2 spacing={0} container direction="row" sx={{width: "100%"}}> */}
            <Box sx={{display: 'flex', justifyContent: 'space-between'}}>
                <ListSubheader id="challenges-title">Challenges</ListSubheader>
                <Box sx={{display: 'flex', flexDirection: 'row'}}>
                    <ListSubheader sx={{p:0}} id="challenges-title">Hide Completed</ListSubheader>
                    <Checkbox sx={{pl:1}} checked={hideCompleted} onChange={handleHideCompleted} />
                </Box>
                </Box>
            {/* </Grid2> */}
            <Grid2 container direction="row" spacing={2}>
                {props.challenges.map((item) => (
                    <>
                        {hideCompleted && item.completed ?
                            (<></>)
                            : (
                                <Grid2 size={{ xs: 12, md: 6 }}>
                                    <Paper sx={{ my: 1 }} elevation={props.elevation}>

                                        <FormControl aria-label="Challenge selection" sx={{ width: "100%" }}>
                                            <Box sx={{display: 'flex', flexDirection:'row-reverse'}}>
                                                {item.found && <Typography>✅</Typography>}
                                                {item.completed && <Typography>✅</Typography>}
                                            </Box>
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
                                                        <Button sx={{ width: 1 }} onClick={() => props.handleShow("https://seattle-scramble.s3.us-west-2.amazonaws.com/IMG_6506AM.jpeg")} variant="outlined">View</Button>
                                                    </Grid2>
                                                    {!item.completed &&
                                                        <Grid2 sx={{ p: 1 }} display={"flex"} justifyContent={"center"} item size={{ xs: 12, md: 3 }}>
                                                            <Button sx={{ width: 1 }} onClick={() => handleUploadClick(item)} variant="outlined" type="submit">Submit {item.found ? "Challenge" : "Location"}</Button>
                                                            <input
                                                                ref={fileInput}
                                                                type="file"
                                                                accept="image/*"
                                                                style={{ display: 'none' }}
                                                            />
                                                        </Grid2>
                                                    }
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