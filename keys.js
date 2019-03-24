const spotify = {
            id: process.env.SPOTIFY_ID,
            secret: process.env.SPOTIFY_SECRET,
        };
const omdb = process.env.OMDB_KEY
const bandsintown = process.env.BANDSINTOWN_KEY

module.exports = {
    spotify: spotify,
    omdb: omdb,
    bit: bandsintown
}