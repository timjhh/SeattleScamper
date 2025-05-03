/* eslint-disable react/prop-types */
import {
    Grid2,
    Paper,
} from "@mui/material";
import * as d3 from 'd3';

import { useEffect, useState, useRef } from 'react';
import './App.css';
import { SnackbarProvider, enqueueSnackbar } from 'notistack';
import AuthDisplay from "./AuthDisplay.jsx";
import Score from "./Score.jsx";
import Events from "./Events.jsx"
import About from './About.jsx';
import Message from "./Message.jsx";
import ZoneSelect from "./ZoneSelect.jsx";
import Challenges from "./Challenges.jsx";

function Game(props) {
    const elevation = 5;
    const destroyed = "oklch(0% 0 300)";

    // Coloring for map.
    const highlightColor = 'oklch(75% 0.1801 216.4)'

    const teamHue = "300"
    const enemyHue = "175"
    const neutral = "oklch(90% 0 360)"
    const lightness = ["85%", "85%", "55%", "35%"]
    const getColor = (item, faded) => {
        if (!item) return neutral
        if (item.destroyed) return destroyed
        if (item.level === 0) return neutral
        if (item.team_id === 1) return `oklch(${lightness[Math.min(item.level, 3)]} ${faded ? '0.03' : '0.1'} ${teamHue})`
        if (item.team_id === 2) return `oklch(${lightness[Math.min(item.level, 3)]} ${faded ? '0.03' : '0.1'} ${enemyHue})`
        // Base case.
        return neutral
    }

    // Interactivity for map.
    const width = 800, height = 800;
    const margin = {left: 10, right: 10, top: 10, bottom: 10}
    const [mapLoaded, setMapLoaded] = useState(false)

    const [canton, setZone] = useState({});
    const [mapZone, setMapZone] = useState("")
    const [zones, setZones] = useState([])

    // Player state.
    const [teams, setTeams] = useState({})

    const [myPowerups, setMyPowerups] = useState([])
    const [myPowerup, setMyPowerup] = useState("")

    const [events, setEvents] = useState([]);

    const [challenges, setChallenges] = useState([]);

    // updateEvents is a hook to re-fetch.
    const [updateEvents, setUpdateEvents] = useState(0);

    const [curses, setCurses] = useState([])


    // Fetch all data on initial map load.
    useEffect(() => {
        if (!mapLoaded) {
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
        // await fetchEndpoint("/zones/")
        await fetchEndpoint("/teams/")
        await fetchEndpoint("/challenges/")
        // await fetchEndpoint("/curses/")
    }

    // For canton selection updated through the ZoneSelect element,
    // ensure we update the map too.
    useEffect(() => {
        updateSelected(canton.name);
    }, [canton]);

    useEffect(() => {
        updateColors(zones)
    }, [zones])

    useEffect(() => {
        updateSelected(mapZone);
        setZone(zones.find((e) => e.name == mapZone) || {})
    }, [mapZone]);

    useInterval(function() {
        //fetchEndpoint("/events/")
        //fetchEndpoint("/zones/")
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

        // d3.geoAlbers()
        // d3.geoMercator()
        var projection = d3.geoMercator()
            //.fitExtent([[margin.left, margin.top], [width - margin.right, height - margin.bottom]], topojson.feature(data, data.features));    
            .fitSize([width, height], data)
            // .rotate([0, 0])
            // .center([1,1])
            // .scale(5000)
            // .translate([width / 2, height / 2])
            //.precision(.1);

        var path = d3.geoPath()
            .projection(projection);

        let svg = d3
            .select("#travelmap")
            .attr("viewBox", [0, 0, width, height])
            .attr("width", "100%")
            .attr("height", "50vh")
            //.on('click', d => (d.target.id == setMapZone(d.target.id)))
            .attr("style", "max-width: 100%; text-align: center;")

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
            .attr("id", d => d.properties.name.replaceAll(" ", ""))
            .attr("stroke", "black")
            .attr("stroke-width", "0.5px")

        createBubbleByNeighborhood("Roosevelt", 5, 5)
        createBubbleByNeighborhood("GreenLake", 10, 10)
        createBubbleByNeighborhood("Wallingford", 6, 10)
        createBubbleByNeighborhood("UniversityDistrict", 5, 10)
        createBubbleByNeighborhood("Montlake", 1, 8)
        createBubbleByNeighborhood("Leschi", 1, 10)
        createBubbleByNeighborhood("Broadway", 6, 9)
//        createBubbleByNeighborhood("Ballard", 1)

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

    function createBubbleByNeighborhood(neighborhood, count, size) {
        let rs = d3.select(`#${neighborhood}`)
        let bbox = rs.node().getBBox()

        let cr = d3.select("#pathsG").select(".zones")
        .append('g')
        .attr("class", "mapholder")
        .attr("transform", function(d){return "translate("+(bbox.x + bbox.width/2)+","+(bbox.y + bbox.height/2)+")"})

        cr
        .append("circle")
          .attr("r", (size*5))
          .style("fill", "#FFFFFF")
          .attr("opacity", 0.5)
          .attr("stroke", "#69b3a2")
          .attr("stroke-width", 3)
          .attr("fill-opacity", .4)
        cr.append("text")
        .attr("dx", -5)
        .text(count)
    }

    function getRandomColor() {
        var letters = '0123456789ABCDEF';
        var color = '#';
        for (var i = 0; i < 6; i++) {
          color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
      }
      

    function updateSelected(selected) {
        var g = d3.select("#pathsG").select(".zones").selectAll("g");
        if (selected && selected !== "" && selected !== "travelmap") {
            g.selectAll("path")
                .transition()
                .duration(200)
                .attr("fill", (d) => d.properties.name === selected ? highlightColor : getColorForZone(d.properties.name, true))
                .attr("stroke-width", (d) => d.properties.name === selected ? 3 : "0.1px");
        } else {
            g.selectAll("path")
                .transition()
                .duration(200)
                .attr("fill", (d) => getColorForZone(d.properties.name, false))
                .attr("stroke-width", "0.1px");
        }
    }

    function updateColors() {
        var g = d3.select("#pathsG").select(".zones").selectAll("g");
        g.selectAll("path")
            .transition()
            .duration(200)
            .attr("fill", (d) => getColorForZone(d.properties.name, false))
            .attr("stroke-width", "0.1px");
    }

    function getColorForZone(value, faded) {
        let item = zones.find(e => e.name === value)
        return getColor(item, faded)
    }

    async function fetchEvents() {
        //await fetchEndpoint("/teams/")
        // await fetchEndpoint("/zones/")
    }

    const objectsEqual = (o1, o2) => 
        typeof o1 === 'object' && Object.keys(o1).length > 0 
            ? Object.keys(o1).length === Object.keys(o2).length 
                && Object.keys(o1).every(p => objectsEqual(o1[p], o2[p]))
            : o1 === o2;


    const arraysEqual = (a1, a2) => 
        a1.length === a2.length && a1.every((o, idx) => objectsEqual(o, a2[idx]));



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
                    if(!data || data.length == 0) return;
                    switch (endpoint) {
                        case "/teams/":
                            setTeams(data)
                            break;
                        case "/events/":
                            // Only update the events if something has actually changed.
                            if((Math.max(...data.map(o => o.id)) !== Math.max(...events.map(o => o.id))) || events.length === 0) {
                                setEvents(data)
                            }
                            break;
                        case "/zones/": {
                            // Only update zones if they have changed.
                            if(!arraysEqual(data.sort((a,b) => a.name < b.name), zones.sort((a,b) => a.name < b.name))) {
                                setZones(data)
                            }
                            break;
                        }
                        case "/challenges/":
                            setChallenges(data.sort((a,b) => Intl.Collator().compare(a.name.toUpperCase(), b.name.toUpperCase())))
                            break;
                        case "/curses/":
                            setCurses(data)
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
        let op = endpoint.replaceAll("/", "")
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
            <Grid2 sx={{ my: 2 }} spacing={2} container direction="column" alignItems={"center"} justifyContent={"center"}>
                <Grid2 item size={{ xs: 11, md: 8 }}>
                    <Paper sx={{ borderColor: 'primary', border: 3 }} elevation={elevation}>
                        <svg display="flex" id="travelmap">
                        </svg>
                    </Paper>
                </Grid2>
                {props.auth ? (
                    <Grid2 item size={{ xs: 11, md: 8 }}>
                        <AuthDisplay
                            fetchEndpoint={fetchEndpoint}
                            teams={teams}
                            challenges={challenges}
                            postEndpoint={postEndpoint}
                            drawerOpen={props.drawerOpen}
                            toggleDrawer={props.toggleDrawer}
                            myPowerup={myPowerup}
                            setMyPowerup={setMyPowerup}
                            myPowerups={myPowerups}
                            setMyPowerups={setMyPowerups}
                            fetchEvents={fetchEvents}
                            updateEvents={updateEvents}
                            setUpdateEvents={setUpdateEvents}
                            auth={props.auth}
                            backend={props.backend}
                            elevation={elevation}
                            canton={canton}
                            setZone={setZone}
                            zones={zones}
                            curses={curses}
                            setCurses={setCurses}
                        />
                    </Grid2>
                ) : (
                    <>
                    <Grid2 item size={{ xs: 11, md: 8 }}>
                        <Paper sx={{ p: 2 }} elevation={elevation}>
                            <Grid2 container spacing={2}>
                                <ZoneSelect teams={teams} canton={canton} zones={zones} setZone={setZone} />
                            </Grid2>
                        </Paper>
                    </Grid2>
                    <Grid2 item size={{ xs: 11, md: 8 }}>
                        <Paper sx={{ p: 2 }} elevation={elevation}>
                            <Grid2 container spacing={2}>
                                
                            </Grid2>
                        </Paper>
                    </Grid2>
                    </>
                )}
                <Grid2 item size={{ xs: 11, md: 8 }}>
                    <Challenges elevation={elevation} challenges={challenges} />
                </Grid2>
                <Grid2 item size={{ xs: 11, md: 8 }}>
                    <Events events={events} fetchEvents={fetchEvents} updateEvents={props.updateEvents} elevation={elevation} />
                </Grid2>
                {props.auth &&
                    <Grid2 item size={{ xs: 11, md: 8 }}>
                        <Message elevation={elevation} postEndpoint={postEndpoint} />
                    </Grid2>
                }
                <Grid2 item size={{ xs: 11, md: 8 }}>
                    <Score teams={teams} elevation={elevation} zones={zones} />
                </Grid2>
                {/* <Grid2 item size={{ xs: 11, md: 8 }}>
                    <About elevation={elevation} />
                </Grid2> */}
            </Grid2>
        </>
    );
}

export default Game;
