/* eslint-disable react/prop-types */
import {
    FormControl,
    ListItem,
    ListSubheader,
    ListItemText,
    Paper,
    List,
    Typography
} from "@mui/material";

// Challenges is a view for un-authenticated users to see all challenges.
function Challenges(props) {
    return (
        <Paper elevation={props.elevation}>
        <FormControl aria-label="Challenge selection" sx={{ width: "100%" }}>
            <ListSubheader id="challenges-title">Challenges</ListSubheader>
            <List
                sx={{
                    width: '100%',
                    bgcolor: 'background.paper',
                    position: 'relative',
                    overflow: 'auto',
                    maxHeight: 300,
                    '& ul': { padding: 0 },
                }}
                subheader={<li />}
            >
                {props.challenges.sort((a, b) => Date.parse(b.time) - Date.parse(a.time)).map((item) => (
                    <ListItem key={`chal-${item.name}`} {...props}>
                        <ListItemText primary={`${item.name}`} secondary={`${item.description}`} />
                    </ListItem>
                ))}
            </List>

        </FormControl>
        </Paper>
    )
}

export default Challenges