require('dotenv').config();
const axios = require('axios');
const keys = require('./keys');
const Spotify = require('node-spotify-api');
const spotify = new Spotify(keys.spotify);
const command = process.argv[2].toLowerCase();
const arg = process.argv[3] ? process.argv.slice(3).join(' ').toLowerCase() : null;
const fs = require('fs');
const moment = require('moment');

const commands = {
    "spotify-this-song": (song = 'Never Gonna Give You Up') => {
        spotify.search({ type: 'track', query: song, limit: 1 }, (err, data) => {
            if (err) {
                return console.log(`Error in Spotify search: ${err}`)
            }
            let output = `\n\nArtist: ${data.tracks.items[0].album.artists[0].name}`;
            output += `\nTrack Name: ${data.tracks.items[0].name}`;
            output += `\nPreview URL: ${data.tracks.items[0].preview_url}`;
            output += `\nAlbum: ${data.tracks.items[0].album.name}\n\n`;
            console.log(output);
        })
    },
    "movie-this": (movie = 'Mr. Nobody') => {
        const query = `http://www.omdbapi.com/?t=${movie}&y=&plot=short&apikey=${keys.omdb}`;
        axios.get(query).then(response => {
            try {
                let output = `\n\nTitle: ${response.data.Title}`;
                output += `\nYear: ${response.data.Released.substr(-4)}`;
                output += `\n${response.data.Ratings[0].Source} Rating: ${response.data.Ratings[0].Value}`;
                output += `\n${response.data.Ratings[1].Source} Rating: ${response.data.Ratings[1].Value}`;
                output += `\nCountry: ${response.data.Country}`;
                output += `\nLanguage: ${response.data.Language}`;
                output += `\nPlot: ${response.data.Plot}`;
                output += `\nActors: ${response.data.Actors}\n\n`;
                console.log(output);
            }
            catch (e) {
                fs.appendFile('log.txt', `${Date()}\n${query}\n${e}\n`, err => { if (err) console.log(err) });
                console.log('Sorry, couldn\'t find that movie.  Please try again')
            }
        })
    },
    "concert-this": (band = "Drake") => {
        const query = `https://rest.bandsintown.com/artists/${band}/events?app_id=${keys.bit}`;
        axios.get(query).then(response => {
            try {
                response.data.forEach(e => {
                    let output = `\nVenue: ${e.venue.name}`;
                    output += `\nLocation: ${e.venue.region ? e.venue.city + ', ' + e.venue.region : e.venue.city}`;
                    output += `\nDate: ${moment(e.datetime).format('MM/DD/YYYY')}\n`;
                    console.log(output);

                })
            }
            catch (e) {
                fs.appendFile('log.txt', `${Date()}\n${query}\n${e}\n`, err => { if (err) console.log(err) });
                console.log('Sorry, couldn\'t find that band.  Please try again')
            }
        })
    },
    "do-what-it-says": _ => {
        fs.readFile('random.txt', 'utf8', (err, data) => {
            if (err) {
                return console.log('Cannot read the file');
            }
            const fileText = data.split(',');
            commands[fileText[0]](fileText[1]);
        })
    }
}
arg ? commands[command](arg) : commands[command]();