/* eslint-disable react/prop-types */
import {
    Grid2,
    FormControl,
    Autocomplete,
    TextField,
    ListItem,
    ListItemText
} from "@mui/material";

function NeighborhoodSelect(props) {

    function getTeamName(id) {
        if(props.teams && props.teams.length) {
            let item = props.teams.find(e => e.id == id)
            if(item) return item.name
        }
        if(props.canton.name) return "None"
        return ""
    }

    return (
        <>
            <Grid2 spacing={2} sx={{padding:1}} container direction="row" >
            <Grid2 item size={{ xs: 9 }}>
                <FormControl sx={{ width: "100%" }} aria-label="Neighborhood display">
                    <TextField id="level-textfield" label="Neighborhood" defaultValue={props.selectedNeighborhood} slotProps={{ inputLabel: { shrink: true }, input: { readOnly: true } }} />
                </FormControl>
            </Grid2>
            <Grid2 item size={{ xs: 3 }}>
                <FormControl sx={{ width: "100%" }} aria-label="Canton team display">
                    <TextField id="team-textfield" label="Remaining Challenges" defaultValue={props.remaining} slotProps={{ inputLabel: { shrink: true }, input: { readOnly: true } }} />
                </FormControl>
            </Grid2>
            </Grid2>
        </>
    )
}

export default NeighborhoodSelect;