/* eslint-disable react/prop-types */
import {
    Paper,
    Grid2,
    Box,
    Typography,
    Accordion,
    AccordionSummary,
    AccordionDetails,
} from "@mui/material";
import './App.css';



function About(props) {
    return (
        <>
            <Box className="parallax seattlebg" display={"flex"} alignItems={"center"} justifyContent={"center"} alignContent={"center"}>
                <Box mx={3} px={1} display={"flex"} alignItems={"center"} sx={{ height: '60vh' }} >
                    <div className="titlebox">
                        <div className="titlebody">
                            <Typography className="title" align="start" variant="h2">Seattle Scramble</Typography>
                            <Typography className="title" align="end" variant="h3">June 29, 2025</Typography>
                        </div>
                    </div>
                </Box>
            </Box>
            <Box sx={{ backgroundColor: 'oklch(0.6582 0.169 248.81)', p:1 }}>
                <Typography sx={{ m: 2 }} align="center" variant="h6">
                    The Seattle Scramble is a public transit based strategy game. Teams will use transit to traverse the city and complete challenges.
                </Typography>
            </Box>

            <Box className="parallax transitbg" display={"flex"} alignItems={"center"} justifyContent={"center"} alignContent={"center"}>
            </Box>

            <Grid2 size={{ xs: 12 }}>

            <Accordion>
                <AccordionSummary><Typography variant="h4">Schedule</Typography></AccordionSummary>
                <AccordionDetails>
                <ul>
                    <li>The game will run from 1pm-6pm</li>
                    <li>Players should meet outside of the <a target="_blank" rel="noopener noreferrer" href="https://maps.app.goo.gl/NVMSqmpp3HLpKC1M8">University of Washington Lightrail Station</a> at 1pm.</li>
                    <li>Players should meet at Westlake Station at 6pm.</li>
                </ul>  
                </AccordionDetails>
            </Accordion>
            <Accordion>
                <AccordionSummary><Typography variant="h4">Gameplay</Typography></AccordionSummary>
                <AccordionDetails>
                <Typography>
                    The objective of the game is to accrue the most points for your team within the game's timespan.
                    <br/><br/>
                    Players will start with a map depicting each neighborhood and the amount of challenges remaining in each one. A challenge is composed of a location visit and secret challenge.
                    Players must visit the location and submit a photograph of their team there to unlock the challenge. Players can then complete the challenge to earn additional points. 
                </Typography>     
                </AccordionDetails>
            </Accordion>
            <Accordion>
                <AccordionSummary><Typography variant="h4">Requirements</Typography></AccordionSummary>
                <AccordionDetails>
                <ul>
                    <li>A smartphone</li>
                    <li>An ORCA Card with at least $20</li>
                    <li>Water (optional, recommended)</li>
                    <li>Sunscreen (optional, recommended)</li>
                    <li>a postable charger (optional, recommended)</li>
                </ul>    
                </AccordionDetails>
            </Accordion>
            <Accordion>
                <AccordionSummary><Typography variant="h4">Rules</Typography></AccordionSummary>
                <AccordionDetails>
                <ul>
                    <li><b>Players may not jaywalk.</b></li>
                    <li>Teams may not work with other teams to complete challenges.</li>
                    <li>Challenge submission is asynchronous, but will be reviewed. It is an expectation that teams are honest about their submissions, and they are done
                        to the best of your ability.</li>
                    <li>Teams are not allowed to split up during gameplay. Any team that is caught splitting up will be disqualified.</li>
                    <li>Teams must meet at the ending location at 6pm. Any team that is not present to check in by 6pm will lose 10 points.</li>
                    <li>Some challenges may require purchasing small items under $5. Players may not bring items to count for challenge completion.</li>
                    <li>Unless specifically stated, challenges may be completed anywhere. 
                        However, teams may not share challenge specifics or complete challenges before they are unlocked.</li>
                    <li>If you are unsure about what counts or does not for a challenge, contact the organizers.</li>
                </ul>
                <Typography variant="h4">Tiebreaking Rules</Typography>
                In the case of a tie with two or more teams that have the same amount of points, the team who has completed more challenges will win.
                If that is the same, the quality of challenges submitted will be used as evidence for point deduction.  
                </AccordionDetails>
            </Accordion>

            </Grid2>

        </>
    )
}

export default About;