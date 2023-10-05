import {Avatar, Box, List, ListItem, ListItemAvatar, ListItemText} from "@mui/material";
import * as React from "react";
import {useEffect} from "react";
import {useAppDispatch} from "../../redux/hooks";
import {loadSecretsThunk} from "../../redux/secrets/secretsSlice";
import {PageLayout} from "../../components/layout/page-layout";
import PasswordIcon from '@mui/icons-material/Password';
import {useSelector} from "react-redux";
import {selectTestaments} from "../../redux/testaments/testamentsSelectors";
import AddTestamentDialog from "../../components/testament/add-testament-dialog";

export function Testaments() {

    const dispatch = useAppDispatch();
    const testaments = useSelector(selectTestaments);

    useEffect(() => {
        dispatch(loadSecretsThunk())
    }, [])

    return (
        <PageLayout title="Testaments">
            <Box>
                {testaments &&
                    <Box>
                        <List dense={false}>
                            {testaments.map(testament =>
                                <ListItem key={testament.id}>
                                    <ListItemAvatar>
                                        <Avatar>
                                            <PasswordIcon/>
                                        </Avatar>
                                    </ListItemAvatar>
                                    <ListItemText
                                        primary={testament.name}
                                    />
                                </ListItem>,
                            )}
                        </List>
                    </Box>
                }
            </Box>
            <AddTestamentDialog/>
        </PageLayout>
    );
}
