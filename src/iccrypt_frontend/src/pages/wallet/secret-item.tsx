import {Avatar, IconButton, ListItem, ListItemAvatar, ListItemText} from "@mui/material";
import * as React from "react";
import {FC, ReactNode} from "react";
import DeleteIcon from '@mui/icons-material/Delete';
import {UiSecretListEntry} from "../../services/IcTypesForUi";
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';

export interface SecretItemProps{
    secret: UiSecretListEntry,
    deleteAction: (secret: UiSecretListEntry) => void;
    editAction: (secret: UiSecretListEntry) => void;
    children: ReactNode
}
export const SecretItem: FC<SecretItemProps> = ({secret, children, deleteAction, editAction}) => {

    return (
        <ListItem key={secret.id} secondaryAction={
            <>
            <IconButton edge="end" aria-label="delete" onClick={() => editAction(secret)}>
                <EditOutlinedIcon/>
            </IconButton>
            <IconButton edge="end" aria-label="delete" onClick={() => deleteAction(secret)}>
            <DeleteIcon/>
        </IconButton>
            </>
        }>
            <ListItemAvatar>
                <Avatar>
                    {children}
                </Avatar>
            </ListItemAvatar>
            <ListItemText
                primary={secret.name}
            />
        </ListItem>
    );
}