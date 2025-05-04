/* eslint-disable react/prop-types */
import {
    FormControl,
    ListItem,
    ListSubheader,
    ListItemText,
    Paper,
    List,
    Typography,
    Button
} from "@mui/material";

// Challenges is a view for un-authenticated users to see all challenges.
function Challenges(props) {
    return (
        <>
        {props.challenges.map((item) => (
        <Paper sx={{my:1}} elevation={props.elevation}>
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
                
                    <>
                    <ListItem key={`chal-${item.name}`} {...props}>
                        <Button variant="outlined">View</Button>
                        {/* {props.auth && <></>} TODO: only show submit with auth enabled */}
                        <Button sx={{mx:1}} variant="outlined">Submit Photo</Button>
                        <ListItemText primary={`${item.name}`} secondary={`${item.description}`} />
                    </ListItem>
                    </>
                
            </List>

        </FormControl>
        </Paper>
        ))}
        </>
    )
}

export default Challenges