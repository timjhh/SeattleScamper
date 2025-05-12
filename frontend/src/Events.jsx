/* eslint-disable react/prop-types */
import {
    Paper,
    List,
    ListItem,
    ListItemText,
    ListSubheader
} from "@mui/material";
import { useEffect } from 'react';

function Events(props) {
    // On any rerender, fetch events stream.
    useEffect(() => {
        props.fetchEvents()
    }, [props.updateEvents])


    return (
        <Paper elevation={props.elevation}>
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
                <ListSubheader id="events-title">Announcements</ListSubheader>
                {props.events.sort((a,b) => Date.parse(b.time) - Date.parse(a.time)).map((item) => (
                    <ListItem id={`itemid-${item.id}-${item.time}`} key={`item-${item.id}-${item.time}`}>
                        <ListItemText primary={<b>{item.text}</b>} secondary={`${new Date(item.time).toLocaleString()}`} />
                    </ListItem>
                ))}
            </List>
        </Paper>
    )
}


export default Events