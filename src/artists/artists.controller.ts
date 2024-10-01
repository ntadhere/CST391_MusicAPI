import { Request, RequestHandler, Response } from "express";
import * as ArtistDAO from './artists.dao';

export const readArtists: RequestHandler = async (req: Request, res: Response) => {
    try {
        const artists = await ArtistDAO.readArtists();

        res.status(200).json(
            artists 
        );
    } catch (error) {
        console.error('[artist.controller][ReadArtists][Error] ', error);
        res.status(500).json ({
            message: 'There was an error when fetching artists'
        });
    }
};