/* eslint-disable react/prop-types */
import {
    Paper,
    Typography,
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
            let group = groupBy(props.teams, 'score')
            setScore(group)
        }
    }, [props.teams])

    function generateSuffix(num) {
        let suffix = "";
        if (num === 1) suffix = "st";
        if (num === 2) suffix = "nd";
        if (num === 3) suffix = "rd";
        if (num > 3) suffix = "th";

        return `${num}${suffix}`
    }

    return (
        <>
            {Object.keys(score).length > 0 && (
                <Paper sx={{ p: 1 }} elevation={props.elevation}>
                    {Object.keys(score).sort().reverse().map((key, idx) => (
                        <div key={`score${score[key].team_name}-${idx}`}>
                            <Typography variant="h5" component="div" align="left" sx={{ flexGrow: 1, my: 1 }}>{generateSuffix((idx + 1))} Place({key} points):</Typography>
                            {score[key].map(team => (
                                <Typography sx={{ color: 'text.secondary' }} component="div" align="left" key={`${Math.random().toString(16).slice(2)}`}>{team.team_name} &nbsp;</Typography>
                            ))}
                        </div>
                    ))}
                </Paper>
            )}
        </>
    )
}

export default Score;