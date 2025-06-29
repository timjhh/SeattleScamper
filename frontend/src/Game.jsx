/* eslint-disable react/prop-types */
import {
    Grid2,
    Box,
    Modal,
    Typography,
    Paper,
} from "@mui/material";
import * as d3 from 'd3';
import CloseIcon from '@mui/icons-material/Close';
import { useEffect, useState, useRef } from 'react';
import './App.css';
import { SnackbarProvider, enqueueSnackbar } from 'notistack';
import Score from "./Score.jsx";
import Events from "./Events.jsx"
import Message from "./Message.jsx";
import Challenges from "./Challenges.jsx";
import About from "./About.jsx";
import NeighborhoodSelect from "../NeighborhoodSelect.jsx";

function Game(props) {
    const elevation = 5;
    // image view modal toggles.
    const [show, setShow] = useState(false);
    const [currentURL, setCurrentURL] = useState("")
    const [selectedNeighborhood, setSelectedNeighborhood] = useState("")
    const [remaining, setRemaining] = useState("")
    const handleClose = () => setShow(false);
    const handleShow = (u) => {
        if(u === '') {
            setCurrentURL('')
            return
        }
        setShow(true)
        setCurrentURL(u)
    }

    const style = {
        margin: 'auto',
        display: 'flex',
        alignContent: 'center',
        justifyContent: 'center',
        alignItems: 'center'
    };


    // Interactivity for map.
    const width = 800, height = 800;
    const [mapLoaded, setMapLoaded] = useState(false)

    const [zones, setZones] = useState([])

    // Player state.
    const [teams, setTeams] = useState({})
    const [team, setTeam] = useState({});
    const [rank, setRank] = useState(0)

    const [events, setEvents] = useState([]);
    const [challenges, setChallenges] = useState([]);
    const [teamChallenges, setTeamChallenges] = useState([])

    // Fetch all data on initial map load.
    useEffect(() => {
        if (!mapLoaded && props.auth) {
            makeGame()
        }
    }, []);

    async function makeGame() {
        await fetch("./neighborhoods.geojson")
            .then((response) => {
                return response.json()
            })
            .then((data) => {
                drawMap(data)
            })
            .catch((err) => {
                console.log("Error rendering map data " + err);
            });
        
        await fetchEndpoint("/events/")
        await fetchEndpoint("/team/")
        // await fetchEndpoint("/zones/")
        await fetchEndpoint("/teams/")
        await fetchEndpoint("/team/challenges/")
        await fetchEndpoint("/challenges/")
        // await fetchEndpoint("/curses/")
    }

    // For canton selection updated through the ZoneSelect element,
    // ensure we update the map too.
    // useEffect(() => {
    //     updateSelected(canton.name);
    // }, [canton]);

    // useEffect(() => {
    //     updateColors(zones)
    // }, [zones])

    useEffect(() => {
        d3.selectAll("circle").each((d,i,nodes) => {
            d3.select(nodes[i])
            .transition().duration(200)
            .attr("fill", nodes[i].id === selectedNeighborhood ? 'red' : '#FFFFFF')
        })
    }, [selectedNeighborhood])

    // getChallenge returns a challenge's state given its id.
    function getChallenge(id) {
        return teamChallenges.find(c => c.challenge_id === id)
    }

    useEffect(() => {
        if (challenges.length === 0) return;
        const neighborhoodSizes = {
            "Roosevelt": 5,
            "Ravenna": 8,
            "GreenLake": 10,
            "Wallingford": 10,
            "UniversityDistrict": 10,
            "Montlake": 8,
            "Leschi": 10,
            "Broadway": 9,
            "Belltown": 6,
            "InternationalDistrict": 5,
            "FirstHill": 5,
            "Pike-Market": 3,
            "CentralBusinessDistrict": 5,
            "LowerQueenAnne": 6,
            "SouthLakeUnion": 8,
            "Fremont": 8,
            "default": 10,
        }


        d3.selectAll("circle").remove();

        // Challenges will be grouped by neighborhood.
        // Once grouped, display the number of challenges in each neighborhood.
        let grouped = groupBy(challenges, 'neighborhood');
        Object.keys(grouped).forEach((neigh,idx) => {
            // Filter for total amount of points in each challenge. Filter for points your team has. Subtract the second from the first. 
            let remaining = grouped[neigh].reduce((a,curr) => a+(curr.points), 0)
            let finished = grouped[neigh].filter(c => getChallenge(c.id)?.completed).reduce((a,curr) => a+(curr.points), 0)
            
            let uncompleted = remaining - finished;
            uncompleted > 0 && createBubbleByNeighborhood(neigh, uncompleted, neighborhoodSizes[neigh] ? neighborhoodSizes[neigh] : neighborhoodSizes['default']);
        })
    }, [challenges]);

    useInterval(function () {
            fetchEndpoint("/events/")
            fetchEndpoint("/teams/")
    }, 5000)

    function useInterval(callback, delay) {
        const savedCallback = useRef();

        // Remember the latest callback.
        useEffect(() => {
            savedCallback.current = callback;
        }, [callback]);

        // Set up the interval.
        useEffect(() => {
            function tick() {
                savedCallback.current();
            }
            if (delay !== null) {
                let id = setInterval(tick, delay);
                return () => clearInterval(id);
            }
        }, [delay]);
    }

    // drawMap renders on the svg an interactive map.
    // It sets the projection, zoom functionality and coloring.
    function drawMap(data) {
        if (mapLoaded) return
        setMapLoaded(true)

        const canvas = d3.select('#travelmap')
        canvas.selectAll("*").remove()

        var projection = d3.geoMercator()
            .fitSize([width, height], data)

        var path = d3.geoPath()
            .projection(projection);

        let svg = d3
            .select("#travelmap")
            .attr("viewBox", [0, 0, width, height])
            .attr("width", "100%")
            .attr("height", "50vh")
            .attr("style", "max-width: 100%; text-align: center; background-color: oklch(0.9 0.0666 210.71 / 30%)")

        let g = svg
            .append("g")
            .attr("id", "pathsG")

        const mapZones = g
            .append("g")
            .attr("class", "zones")
            .selectAll(".mapholder")
            .data(data.features)
            .join("g")
            .attr("class", "mapholder")
            .attr("id", "mapzoneid")

        mapZones.append("path")
            .attr("class", "canton")
            .attr("d", path)
            .attr("fill", "oklch(0.7 0.1 142)")
            .attr("id", d => d.properties.name?.replaceAll(" ", ""))
            .attr("stroke", "black")
            .attr("stroke-width", "0.5px")

        const zoom = d3
            .zoom()
            .scaleExtent([1, 6])
            .translateExtent([[0, 0], [width, height]])
            .on("zoom", (d) => {
                g.attr("transform", d.transform);
            });

        d3.select("#slider")
            .datum({})
            .attr("aria-label", "zoom-slider")
            .attr("type", "range")
            .attr("value", zoom.scaleExtent()[0])
            .attr("min", zoom.scaleExtent()[0])
            .attr("max", zoom.scaleExtent()[1])
            .attr("step", (zoom.scaleExtent()[1] - zoom.scaleExtent()[0]) / 100);

        svg.call(zoom)
    }


    var groupBy = function (xs, key) {
        return xs.reduce(function (rv, x) {
            (rv[x[key]] ??= []).push(x);
            return rv;
        }, {});
    };

    function createBubbleByNeighborhood(neighborhood, count, size) {
        let rs = d3.select(`#${neighborhood}`)
        if(!rs || !rs.node()) return;
        let bbox = rs.node().getBBox()

        let cr = d3.select("#pathsG").select(".zones")
            .append('g')
            .attr("class", "mapholder")
            .attr("transform", function () { return "translate(" + (bbox.x + bbox.width / 2) + "," + (bbox.y + bbox.height / 2) + ")" })

        cr
            .append("circle")
            .attr("r", (size * 5))
            .attr("fill", "#FFFFFF")
            .attr("opacity", 0.5)
            .attr("stroke", "black")
            .attr("stroke-width", 1)
            .attr("fill-opacity", .4)
            .attr('id', neighborhood)
            .on('click', () => (updateNeighborhood(neighborhood, count)))
        cr.append("text")
            .attr("dx", -5)
            .attr("dy", 5)
            .text(count)
    }

    function updateNeighborhood(neighborhood, count) {
        setSelectedNeighborhood(neighborhood)
        setRemaining(count)
    }


    async function fetchEvents() {
        await fetchEndpoint("/teams/")
        await fetchEndpoint("/team/challenges/")
        // await fetchEndpoint("/zones/")
    }

    const objectsEqual = (o1, o2) =>
        typeof o1 === 'object' && Object.keys(o1).length > 0
            ? Object.keys(o1).length === Object.keys(o2).length
            && Object.keys(o1).every(p => objectsEqual(o1[p], o2[p]))
            : o1 === o2;


    const arraysEqual = (a1, a2) => a1.length === a2.length && a1.every((o, idx) => objectsEqual(o, a2[idx]));

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
                    if (!data || data.length == 0) {
                        resolve();
                        return;
                    }
                    if (data.detail) {
                        resolve();
                        return
                    }
                    switch (endpoint) {
                        case "/teams/":
                            setTeams(data)
                            break;
                        case "/team/":
                            setTeam(data)
                            break;
                        case "/events/":
                            //Only update the events if something has actually changed.
                            if ((Math.max(...data.map(o => o.id)) !== Math.max(...events.map(o => o.id))) || events.length === 0) {
                                setEvents(data)
                            }
                            break;
                        case "/zones/": {
                            // Only update zones if they have changed.
                            if (!arraysEqual(data.sort((a, b) => a.name < b.name), zones.sort((a, b) => a.name < b.name))) {
                                setZones(data)
                            }
                            break;
                        }
                        case "/team/challenges/":
                            setTeamChallenges(data)
                            break;
                        case "/challenges/":
                            setChallenges(data)
                            break;
                        default:
                            console.log(`warning: no endpoint handler available for ${endpoint}`)
                            resolve();
                    }
                    resolve();
                })
                .catch((err) => {
                    enqueueSnackbar(`Failed to fetch data for ${endpoint}: ${err}`, { variant: "error", autoHideDuration: 3000 })
                    resolve(err) // This application is not robust enough to handle rejection.
                });
        })
    }

    async function postEndpoint(endpoint, body) {
        let op = endpoint?.replaceAll("/", "")
        return new Promise((resolve) => {
            fetch(props.backend + endpoint, {
                method: 'POST',
                body: body,
                headers: new Headers({
                    'Authorization': `Bearer ${props.auth}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                }),
            })
                .then((response) => {
                    switch (response.status) {
                        case 401:
                            enqueueSnackbar(`Failed to submit ${op}: ${response.statusText}`, { variant: "error", autoHideDuration: 3000 })
                            break;
                        case 422:
                            enqueueSnackbar(`Failed to submit ${op}: ${response.statusText}`, { variant: "error", autoHideDuration: 3000 })
                            break;
                        case 200:
                            enqueueSnackbar(`Successfully submitted ${op} 🎉`, { variant: "success", autoHideDuration: 3000 })
                            break;
                        case 400:
                            Promise.resolve(response.json()).then(data => {
                                if (data.detail) enqueueSnackbar(`Submit ${op}: ${data.detail}`, { variant: "warning", autoHideDuration: 3000 })
                            })
                            break;
                        default:
                            enqueueSnackbar(`Unknown submit operation ${response.status} ${op}: ${response.statusText}`, { variant: "warning", autoHideDuration: 3000 })
                    }
                    resolve(response.status)
                })
                .then(() => {
                    fetchEvents()
                })
                .catch((err) => {
                    enqueueSnackbar(`failed to submit ${op}: ${err}`, { variant: "error", autoHideDuration: 3000 })
                    resolve(err) // This application is not robust enough to handle rejection.
                });
        })
    }


    return (
        <>
            <SnackbarProvider maxSnack={5} />
            <Modal
                open={show}
                onClose={handleClose}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Box sx={style}>
                    <img onClick={handleClose} className="modalimg" src={currentURL} />
                    <CloseIcon onClick={handleClose} sx={{ position: 'absolute', top: 0, right: 0 }} style={{color: "black", "cursor": "pointer"}} />
                </Box>
            </Modal>

            {/* <Grid2 container direction="column" display={"flex"} alignItems={"center"} justifyContent={"center"} alignContent={"center"}> */}
            <Box>
                {props.auth ? (
                    <Grid2 container direction="column" display={"flex"} alignItems={"center"} justifyContent={"center"} alignContent={"center"}>
                        <Grid2 sx={{mt: 5}} size={{ xs: 11, md: 9 }}>
                            <Paper sx={{ borderColor: 'primary', border: 3 }} elevation={elevation}>
                                <svg display="flex" id="travelmap">
                                </svg>
                            </Paper>
                        </Grid2>
                        <Grid2 sx={{mt: 5}} size={{ xs: 11, md: 9 }}>
                            <Paper elevation={elevation}>
                                <NeighborhoodSelect remaining={remaining} selectedNeighborhood={selectedNeighborhood} />
                            </Paper>
                        </Grid2>
                        <Grid2 sx={{my:2}} size={{ xs: 11, md: 9 }}>
                            <Events events={events} fetchEvents={fetchEvents} updateEvents={props.updateEvents} elevation={elevation} />
                        </Grid2>
                        {team.username === "timjhh" &&
                        <Grid2 sx={{my:2}} size={{ xs: 11, md: 9 }}>
                            <Message elevation={elevation} postEndpoint={postEndpoint} />
                        </Grid2>
                        }
                        <Grid2 size={{ xs: 11, md: 9 }}>
                            <Paper sx={{ p: 1, mt:2 }} elevation={elevation}>
                                <Typography sx={{ textAlign: 'center' }} variant="h5">{team.team_name}</Typography>
                                <Grid2 justifyContent={'space-evenly'} sx={{ textAlign: 'center' }} container direction="row" spacing={2}>
                                    <Grid2 item size={{ sx: 6 }}>
                                        <Typography variant="h4">Score</Typography>
                                        <Typography variant="h4">{team.score}</Typography>
                                    </Grid2>
                                    <Grid2 item size={{ sx: 6 }}>
                                        <Typography variant="h4">Rank</Typography>
                                        <Typography variant="h4">{rank}</Typography>
                                    </Grid2>
                                </Grid2>
                            </Paper>
                        </Grid2>
                        <Grid2 size={{ xs: 11, md: 9 }}>
                            <Challenges
                                team={team}
                                teamChallenges={teamChallenges}
                                postEndpoint={postEndpoint}
                                fetchEndpoint={fetchEndpoint}
                                auth={props.auth}
                                elevation={elevation}
                                challenges={challenges}
                                handleShow={handleShow}
                                setCurrentURL={setCurrentURL} />
                        </Grid2>

                        <Grid2 size={{ xs: 12 }} sx={{mt:5}}>
                            <Score sx={{mt:2}} team={team} setRank={setRank} teams={teams} elevation={elevation} zones={zones} />
                        </Grid2>
                    </Grid2>

                )
            : (
                <About elevation={elevation} />
            )}
            </Box>
        </>
    );
}

export default Game;
