/* eslint-disable react/prop-types */
import {
    Paper,
    Typography,
} from "@mui/material";
import './App.css';



function About(props) {
    return (
        <>
            <Paper align="left" sx={{mt: 2, p: 3}} elevation={props.elevation}>
                <Typography variant="h4">Seattle Scramble</Typography>
                <Typography variant="body1">Race to own the most cantons by the end of three days! Teams will uti
                   <a target="_blank" rel="noopener noreferrer" href="https://www.openstreetmap.org/#map=19/47.380725/8.539381">Players will start here.</a>
                </Typography>
                <hr/>
                <Typography variant="h5">Control</Typography>
                <Typography variant="body1">
                f
                </Typography>
                <ul>
                <li>a.</li>
                    <li>a.</li>
                    <li>a.</li>
                </ul>
                <hr/>
                <ul>
                    <li>a.</li>
                    <li>a.</li>
                    <li>a.</li>
                    <li><b>a.</b></li>
                </ul>
                <hr/>
                <Typography variant="h5">Duels</Typography>
                <Typography variant="body1">f hour to start it.
                </Typography>
                

            </Paper>
        </>
    )
}

export default About;