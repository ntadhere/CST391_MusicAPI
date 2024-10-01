import { Request, RequestHandler, Response } from "express";
import { Album } from './albums.model';
import { Track } from './../tracks/tracks.model';
import * as AlbumDao from './albums.dao';
import * as TracksDao from './../tracks/tracks.dao';
import { OkPacket } from 'mysql';

/** READ ALBUM**********
 * *********************
 */
export const readAlbums: RequestHandler = async (req: Request, res: Response) => {
    try {
        let albums;
        let albumId = parseInt(req.query.albumId as string);

        console.log('albumId', albumId);
        if (Number.isNaN(albumId)) {
            albums = await AlbumDao.readAlbums();
        }   else {
            albums = await AlbumDao.readAlbumsByAlbumId(albumId);
        }
        await readTracks(albums, res);

        res.status(200).json(
            albums
        );

    } catch (error) {
        console.error('[albums.controller][readAlbums][Error] ', error);
        res.status(500).json({
            message: 'There was an error when fetching albums'
        });
    }
};

/** READ ALBUM BY ARTIST **********
 * *********************
 */
export const readAlbumsByArtist: RequestHandler = async (req: Request, res: Response) => {
    try {
        const albums = await AlbumDao.readAlbumsByArtist(req.params.artist);

        await readTracks(albums, res);

        res.status(200).json(
            albums
        );
    } catch (error) {
        console.error('[albums.controller][readAlbums][Error] ', error);
        res.status(500).json({
            message: 'There was an error when fetching albums'
        });
    }
};

/** READ ALBUM BY ID **********
 * *********************
 */
export const readAlbumsByAlbumId: RequestHandler = async (req: Request, res: Response) => {
    try {
        // Extract the albumId parameter from the request and convert it to a number
        const albumId = Number(req.params.albumId);  // Assuming 'albumId' is the param name

        // Check if the albumId is a valid number
        if (isNaN(albumId)) {
            return res.status(400).json({
                message: 'Invalid album ID. It must be a valid number.'
            });
        }

        // If albumId is valid, proceed to query the database
        const albums = await AlbumDao.readAlbumsByAlbumId(albumId);

        // Read tracks associated with the albums (assuming this modifies or extends the albums data)
        await readTracks(albums, res);

        // Return the albums in the response
        res.status(200).json(albums);

    } catch (error) {
        // Handle any errors
        console.error('[albums.controller][readAlbumsByAlbumId][Error] ', error);
        res.status(500).json({
            message: 'There was an error when fetching albums'
        });
    }
};

/** READ ALBUM BY ARTIST SEARCH**********
 * *********************
 */
export const readAlbumsByArtistSearch: RequestHandler = async (req: Request, res: Response) => {
    try {
        console.log('search', req.params.search);
        const albums = await AlbumDao.readAlbumsByArtistSearch('%' + req.params.search + '%');

        await readTracks(albums, res);

        res.status(200).json(
            albums
        );
    } catch (error) {
        console.error('[albums.controller][readAlbums][Error] ', error);
        res.status(500).json({
            message: 'There was an error when fetching albums'
        });
    }
};

/** READ ALBUM BY DESCRIPTION SEARCH**********
 * *********************
 */
export const readAlbumsByDescriptionSearch: RequestHandler = async (req: Request, res: Response) => {
    try {
        console.log('search', req.params.search);
        const albums = await AlbumDao.readAlbumsByDescriptionSearch('%' + req.params.search + '%');

        await readTracks(albums, res);

        res.status(200).json(
            albums
        );
    } catch (error) {
        console.error('[albums.controller][readAlbums][Error] ', error);
        res.status(500).json({
            message: 'There was an error when fetching albums'
        });
    }
};

/** CREATE ALBUM**********
 * *********************
 */
export const createAlbum: RequestHandler = async (req: Request, res: Response) => {
    try {
        // Step 1: Insert the album into the database
        const okPacket: OkPacket = await AlbumDao.createAlbum(req.body);
       
        console.log('req.body', req.body);  // For debugging

        // Check if tracks exist in the request body
        if (!req.body.tracks || !Array.isArray(req.body.tracks)) {
            console.error('[albums.controller][createAlbum][Error] No tracks provided or tracks is not an array');
            return res.status(400).json({
                message: 'Tracks must be provided and should be an array.'
            });
        }

        console.log('album', okPacket);

        // Step 2: Insert tracks using a for...of loop to handle async/await properly
        for (const [index, track] of req.body.tracks.entries()) {
            try {
                await TracksDao.createTrack(track, index, okPacket.insertId);  // Associate track with album ID
            } catch (error) {
                console.error('[albums.controller][createAlbumTracks][Error] ', error);
                return res.status(500).json({
                    message: 'There was an error when writing album tracks'
                });
            }
        }

        // Step 3: Respond with success after all tracks have been inserted
        res.status(200).json({
            message: 'Album and tracks created successfully',
            albumId: okPacket.insertId
        });
    } catch (error) {
        console.error('[albums.controller][createAlbum][Error] ', error);
        res.status(500).json({
            message: 'There was an error when writing albums'
        });
    }
};
/** UPDATE ALBUM**********
 * *********************
 */
export const updateAlbum: RequestHandler = async (req: Request, res: Response) => {
    try {
        const okPacket: OkPacket = await AlbumDao.updateAlbum(req.body);
       
        console.log('req.body', req.body);

        console.log('album', okPacket);

        req.body.tracks.forEach(async (track: Track, index: number) => {
            try {
                await TracksDao.updateTrack(track);
            } catch (error) {
                console.error('[albums.controller][updateAlbum][Error] ', error);
                res.status(500).json({
                 message: 'There was an error when updating album tracks'
                });
            }
        });;

        res.status(200).json(
            okPacket
        );
    } catch (error) {
        console.error('[albums.controller][updateAlbum][Error] ', error);
        res.status(500).json({
            message: 'There was an error when updating albums'
        });
    }
};

/** READ TRACKS**********
 * *********************
 */
async function readTracks(albums:Album[], res: Response<any, Record<string, any>>) {
    for (let i = 0; i < albums.length; i++) {
        try {
            const tracks = await TracksDao.readTracks(albums[i].albumId);
            albums[i].tracks = tracks;

        } catch (error) {
            console.error('[albums.controller][readTracks][Error] ', error);
            res.status(500).json({
                message: 'There was an error when fetching album tracks'
            });
        }
    }
}

/** DELETE ALBUM**********
 * *********************
 */
export const deleteAlbum: RequestHandler = async (req: Request, res: Response) => {
    try {
        let albumId = parseInt(req.params.albumId as string);

        console.log('albumId', albumId);
        if (!Number.isNaN(albumId))
        {
            const response = await AlbumDao.deleteAlbum(albumId);
            res.status(200).json(
                response
            );
        } else{
            throw new Error("Integer expected for albumId");
        }
    } catch (error) {
        console.error('[albums.controller][deleteAlbum][Error] ', error);
        res.status(500).json({
            message: 'There was an error when deleting albums'
        });
    }
};



// const ALBUMS = [
//     { id: 1, name: 'Please Please Me (1963)', band: 'The Beatles'},
//     { id: 2, name: 'With The Beatles (1963)', band: 'The Beatles'},
//     { id: 3, name: 'A Hard Day\'s Night (1964) anchester United', band: 'The Beatles'},
//     { id: 4, name: 'Beatles For Sale (1964)', band: 'The Beatles'},
//     { id: 5, name: 'Help! (1965)', band: 'The Beatles'},
//     { id: 6, name: 'Rubber Soul (1965)', band: 'The Beatles'},
//     { id: 7, name: 'Sgt Pepper\'s Lonely Hearts Club Band (1967)', band: 'The Beatles'},
//     { id: 8, name: 'Most of these records are not very good', band: 'The Beatles'},
// ];

// export const getAlbums = (req: Request, res: Response) => {
//     res.send(ALBUMS);
// }