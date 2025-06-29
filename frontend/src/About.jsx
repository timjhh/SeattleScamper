/* eslint-disable react/prop-types */
import {
    Paper,
    Grid2,
    Box,
    Typography,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Button,
} from "@mui/material";
import { Parallax } from 'react-parallax';
import './App.css';
import seattleBg from "/src/assets/seattle.jpg"
import heroBlossom from "/src/assets/hero-blossom.jpg"
import example1 from '/src/assets/example1.png'
import example2 from '/src/assets/example2.png'
import example3 from '/src/assets/example3.png'

function About(props) {
    return (
        <>

            <Parallax sx={{ height: '60vh' }} blur={0} bgImage={seattleBg} bgImageAlt="space needle and dark city" strength={400}>
                <Box display={"flex"} alignItems={"center"} justifyContent={"center"} alignContent={"center"}>
                    <Box mx={3} px={1} display={"flex"} alignItems={"center"} sx={{ height: '80vh' }} >
                        <div className="titlebox">
                            <div className="titlebody">
                                <Typography className="title" align="start" variant="h2">Seattle Scramble</Typography>
                                <Typography className="title" align="end" variant="h3">June 29, 2025</Typography>
                            </div>
                        </div>
                    </Box>
                </Box>
            </Parallax>
            <Box sx={{ backgroundColor: 'oklch(0.6582 0.169 248.81)', p: 1 }}>
                <Typography sx={{ m: 2 }} align="center" variant="h6">
                    The Seattle Scramble is a strategy game where teams use public transit to traverse the city and complete challenges.
                </Typography>
            </Box>
                <Accordion>
                    <AccordionSummary><Typography variant="h3"><b>Gameplay</b></Typography></AccordionSummary>
                    <AccordionDetails>
                        <Typography>
                            The objective of the game is to accrue the most points for your team within the game's timespan.
                            <br /><br />
                            Players will start with a map depicting each neighborhood and the amount of challenges remaining in each one. A challenge is composed of a location visit and secret activity.
                            Players must visit the location and submit a photograph of their team there to unlock the activity. Players can then complete the activity to earn additional points. Teams must begin together
                            at the starting location and end the game by checking in with a game host before 6pm. 
                            <br/><br/>
                            <b>Activities do not have to be completed, and may be difficult to accomplish</b>. Teams may not submit failed activity attempts.
                            <br /><br />
                            Transit games have been growing in popularity in recent years, with some notable examples being <a href="https://en.wikipedia.org/wiki/Jet_Lag:_The_Game" target="_blank" rel="noopener noreferrer">Jet Lag: The Game</a> and <a href="https://en.wikipedia.org/wiki/The_Amazing_Race" target="_blank" rel="noopener noreferrer">The Amazing Race</a>. If you like this game, 
                            consider participating in the local <a href="https://transittrek.org/" target="_blank" rel="noopener noreferrer">Seattle Transit Trek</a> that occurs several times a year.
                        </Typography>
                    </AccordionDetails>
                </Accordion>
                <Accordion>
                    <AccordionSummary><Typography variant="h3"><b>Schedule</b></Typography></AccordionSummary>
                    <AccordionDetails>
                        <ul>
                            <li>The game will run from 1pm-6pm</li>
                            <li>Players should meet at <a target="_blank" rel="noopener noreferrer" href="https://www.google.com/maps/place/Parrington+Lawn,+Seattle,+WA+98105/@47.652027,-122.3180442,16.03z/data=!4m6!3m5!1s0x5490148cb696b529:0xb56819d1831fb7af!8m2!3d47.6579874!4d-122.3108909!16s%2Fg%2F11b8tg0xfp?entry=tts&g_ep=EgoyMDI1MDYwNC4wIPu8ASoASAFQAw%3D%3D&skid=ac4100fc-810d-461f-9b56-d8bfa4a0abe5">Parrington Lawn @ the University of Washginton</a> at 1pm.</li>
                            <li>Players should finish the game at <a target="_blank" rel="noopener noreferrer" href="https://maps.app.goo.gl/ZmJf6Lk9nkoZHSz39">Parrington Lawn @ the University of Washginton</a> at 6pm. <b>Teams will receive a 10 point deduction for being late.</b></li>
                        </ul>
                    </AccordionDetails>
                </Accordion>
            <Parallax sx={{ height: '60vh' }} bgImage={heroBlossom} bgImageAlt="train in cherry blossoms" strength={400}>
                <Box sx={{ height: '60vh'}} display={"flex"} alignItems={"center"} justifyContent={"center"} alignContent={"center"}>
                    <Box display={"flex"} flexDirection={"column"} alignItems={"center"} justifyContent={"center"} alignContent={"center"} sx={{ backgroundColor: 'oklch(0.6582 0.169 248.81 / 80%)', p:2, width:'100%' }} >
                        <Typography variant="h3"><b>Ready to play?</b></Typography>
                        <Button color="secondary" variant="outlined" href="https://partiful.com/e/8s1ZySW9mUCM6AulHFWV" target="_blank" rel="noopener noreferrer">Sign up now</Button>
                    </Box>
                </Box>
            </Parallax>
            <Grid2 size={{ xs: 12 }}>
                <Accordion>
                    <AccordionSummary><Typography variant="h3"><b>Requirements</b></Typography></AccordionSummary>
                    <AccordionDetails>
                        <ul>
                            <li>A smartphone</li>
                            <li>An ORCA Card with at least $20</li>
                            <li>Water (optional, recommended)</li>
                            <li>Sunscreen (optional, recommended)</li>
                            <li>Portable charger (optional, recommended)</li>
                        </ul>
                    </AccordionDetails>
                </Accordion>
                <Accordion>
                    <AccordionSummary><Typography variant="h3"><b>Rules</b></Typography></AccordionSummary>
                    <AccordionDetails>
                        <ul>
                            <li><b>Players may not jaywalk.</b></li>
                            <li><b>Players may not run, unless there there is an immediate risk of missing a bus or train. Teams caught running will face a point penalty.</b></li>
                            <li>Players may not use personal transportation to play the game. This includes driving, ridesharing apps such as Lyft, and ridesharing apps.</li>
                            <li>Teams may not work with other teams to complete challenges.</li>
                            <li>Challenge submission is asynchronous, but will be reviewed. It is an expectation that teams are honest about their submissions, and they are done
                                to the best of your ability.</li>
                            <li>Location submissions and activities do not have to be completed together. You may give up on an activity while still receiving points for finding the location.</li>
                            <li>Teams are not allowed to split up during gameplay. Any team that is caught splitting up will be disqualified.</li>
                            <li>Teams must meet at the ending location at 6pm to check in. Any team that is not present to check in by 6pm will lose 10 points.</li>
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
                <Accordion>
                    <AccordionSummary><Typography variant="h3"><b>How To Play</b></Typography></AccordionSummary>
                    <AccordionDetails>
                        <Grid2 spacing={3} container direction="row" display={"flex"} alignItems={"center"} justifyContent={"space-evenly"} alignContent={"center"}>
                            <Grid2 item size={{xs: 12, md: 4}}>
                                <Typography variant="h5">Step 1: Visit a neighborhood denoted on the map. Neighborhoods will be denoted by remaining points possible to get from challenges.</Typography>
                                <Box>
                                    <img className="imgborder" src={example1} />
                                </Box>
                            </Grid2>
                            <Grid2 item size={{xs: 12, md: 4}}>
                                <Typography variant="h5">Step 2: Find a challenge in that neighborhood to do. You must submit a picture of your team with all members present using the "Submit Visit" button.</Typography>
                                <Box>
                                    <img className="imgborder" src={example2} />
                                </Box>
                            </Grid2>
                            <Grid2 item size={{xs: 12, md: 4}}>
                                <Typography variant="h5">Step 3: Complete the challenge and submit photo or video evidence as requested. Keep in mind longer videos will take longer to upload - you may want to cut the video down.</Typography>
                                <Box>
                                    <img className="imgborder" src={example3} />
                                </Box>
                            </Grid2>
                        </Grid2>

                    </AccordionDetails>
                </Accordion>
                <Accordion>
                    <AccordionSummary><Typography variant="h3"><b>FAQ</b></Typography></AccordionSummary>
                    <AccordionDetails sx={{ m: 3 }}>

                        <Typography variant="h4">How long is the game?</Typography>
                        <Typography variant="body1">
                            The game will require an hour of preparation at 1pm to register all players and teams. The game itself will run from 2-6pm. The ending location will be near
                            some spots to get dinner, so teams are encouraged but not required to stay and join.
                        </Typography>
                        <hr/>
                        <Typography variant="h4">What kinds of transit can I take?</Typography>
                        <Typography variant="body1">
                            Teams are permitted to use any form of public transit and walking. This includes the light rail, bus, monorail, street car, etc.
                            <br/>
                            Players are not allowed to use any form of personal transportation including bike, rideshare app, scooter, skates, car, motorcycle, watercraft or aircraft.
                        </Typography>
                        <hr/>
                        <Typography variant="h4">How fit do I have to be to play?</Typography>
                        <Typography variant="body1">
                            Running is not allowed in this game, except for using public transit. You can expect to be on your feet all day but the game is not designed to be intense.
                        </Typography>
                        <hr/>
                        <Typography variant="h4">What are the game boundaries?</Typography>
                        <Typography variant="body1">
                            No area of Seattle is explicitly prohibited. The game has been designed with existing transit routes in mind, so players are discouraged from straying too far from any transit line as a strategic matter.
                        </Typography>
                        <hr/>
                        <Typography variant="h4">Do I need a team to play?</Typography>
                        <Typography variant="body1">
                            No! Players are encouraged to find and form teams of three prior to the event, but feel free to show up regardless. New teams will be randomly made on the day of the event, or you will be assigned to an existing team.
                        </Typography>
                        <hr/>
                        <Typography variant="h4">Can I use the internet?</Typography>
                        <Typography variant="body1">
                            Yes! You are permitted to use your smartphone for assistance.
                        </Typography>
                        <hr/>
                        <Typography variant="h4">How do I sign up?</Typography>
                        <a href="https://partiful.com/e/8s1ZySW9mUCM6AulHFWV" target="_blank" rel="noopener noreferrer">You can sign up using the Partiful link here.</a>

                    </AccordionDetails>
                </Accordion>
            </Grid2>

        </>
    )
}

export default About;