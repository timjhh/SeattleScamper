/* eslint-disable react/prop-types */
import {
    Paper,
    Typography,
    Grid2,
} from "@mui/material";
import { useEffect, useState } from "react";

var groupBy = function (xs, key) {
    return xs.reduce(function (rv, x) {
        (rv[x[key]] ??= []).push(x);
        return rv;
    }, {});
};

function Score(props) {
    const [score, setScore] = useState({});
    useEffect(() => {
        if (props.teams.length > 0) {
            let group = groupBy(props.teams.filter(t => t.username !== "timjhh"), 'score')
            setScore(group)
            // I'm sorry.
            props.setRank(Object.keys(group).sort().reverse().indexOf(props.team.score?.toString())+1)
        }
    }, [props.teams])

    return (
        <>
            {Object.keys(score).length > 0 && (
                <Paper sx={{ p: 1 }} elevation={props.elevation}>
                    <Typography sx={{mb: 2}} variant="h4" component="div" align="center">Score</Typography>
                    <Grid2 container direction="row" spacing={2}>
                    {Object.keys(score).sort().reverse().map((key, idx) => (
                        <>
                            <Grid2 item size={{xs: 3}}>
                            <Typography variant="h4" component="div" align="center" sx={{ color: 'text.secondary' }}>{idx + 1} </Typography>
                            </Grid2>
                            <Grid2 item size={{xs: 9}}>
                            {key} points
                            {score[key].map(team => (
                                <Typography sx={{ color: 'text.secondary' }} key={`${Math.random().toString(16).slice(2)}`}>➡️{team.team_name} &nbsp;</Typography>
                            ))}
                            </Grid2>
                        </>
                    ))}
                    </Grid2>
                </Paper>
            )}
        </>
    )
}

export default Score;