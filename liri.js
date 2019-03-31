require('dotenv').config();
const axios = require('axios');
const keys = require('./keys');
const Spotify = require('node-spotify-api');
const inquirer = require('inquirer');
const fs = require('fs');
const rick = require('./nggyu');
const formatDate = require('./dateformatter');

const spotify = new Spotify(keys.spotify);
const command = process.argv[2] ? process.argv[2].toLowerCase() : 'noCommand';
const arg = process.argv[3] ? process.argv.slice(3).join(' ').toLowerCase().replace('\'','') : null;

const guideMe = _ => {
    inquirer.prompt([
        {
            type: 'list',
            message: 'What would you like to look up?',
            name: 'search',
            choices: [
                {
                    name: 'Information about a song',
                    value: 'spotify-this-song'
                },
                {
                    name: 'Information about a movie',
                    value: 'movie-this'
                },
                {
                    name: 'Upcoming concerts for a band',
                    value: 'concert-this'
                },
            ]
        },
        {
            message: 'What is the name of the movie/band/song you\'re looking for?',
            name: 'searchterm',
            validate: input => {
                if (!input) {
                    return 'You must enter a search term';
                } return true;
            }
        }
    ]).then(answers => {
        commands[answers.search](answers.searchterm);
    })
}

const commands = {
    "spotify-this-song": (song = 'Never Gonna Give You Up') => {
        console.log(`Searching for that song...`);
        spotify.search({ type: 'track', query: song, limit: 1 }, (err, data) => {
            if (err) {
                fs.appendFile('errorlog.txt', `${Date()}\n${song}\n${e}\n`, err => { if (err) console.log(err) });
                return console.log(`Error in Spotify search: ${err}`)
            }
            const JSONdata = data.tracks.items[0];
            const output = ['',
                `Artist: ${JSONdata.album.artists[0].name}`,
                `Track Name: ${JSONdata.name}`,
                `Preview URL: ${JSONdata.preview_url}`,
                `Album: ${JSONdata.album.name}`
            ].join('\n');
            fs.appendFile('log.txt', output + '\n\n--------------------\n', err => {
                if (err) throw err;
                console.log(output);
            })
            if (song === 'Never Gonna Give You Up') {
                console.log(rick.ascii);
            }
        })
    },
    "movie-this": (movie = 'Mr. Nobody') => {
        console.log(`Searching for that movie...`);
        const query = `http://www.omdbapi.com/?t=${movie}&y=&plot=short&apikey=${keys.omdb}`;
        axios.get(query).then(response => {
            try {
                const output = ['',
                    `Title: ${response.data.Title}`,
                    `Year: ${response.data.Released.substr(-4)}`,
                    `${response.data.Ratings[0].Source} Rating: ${response.data.Ratings[0].Value}`,
                    `${response.data.Ratings[1].Source} Rating: ${response.data.Ratings[1].Value}`,
                    `Country: ${response.data.Country}`,
                    `Language: ${response.data.Language}`,
                    `Plot: ${response.data.Plot}`,
                    `Actors: ${response.data.Actors}`
                ].join('\n');
                fs.appendFile('log.txt', output + '\n\n--------------------\n', err => {
                    if (err) throw err;
                    console.log(output);
                })
            }
            catch (e) {
                fs.appendFile('errorlog.txt', `${Date()}\n${query}\n${e}\n`, err => { if (err) console.log(err) });
                console.log('Sorry, couldn\'t find that movie.  Please try again')
            }
        })
    },
    "concert-this": (band = 'The Killers') => {
        console.log(`Searching for concerts...`);
        const query = `https://rest.bandsintown.com/artists/${band}/events?app_id=${keys.bit}`;
        axios.get(query).then(response => {
            try {
                response.data.forEach(e => {
                    const output = ['',
                        `Venue: ${e.venue.name}`,
                        `Location: ${e.venue.region ? e.venue.city + ', ' + e.venue.region : e.venue.city}`,
                        `Date: ${formatDate(e.datetime)}`
                    ].join('\n');
                    fs.appendFile('log.txt', output + '\n\n--------------------\n', err => {
                        if (err) throw err;
                        console.log(output);
                    })
                })
            }
            catch (e) {
                fs.appendFile('errorlog.txt', `${Date()}\n${query}\n${e}\n`, err => { if (err) console.log(err) });
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
    },
    "noCommand": _ => {
        inquirer.prompt([
            {
                message: 'What would you like to do',
                type: 'list',
                choices: [
                    {
                        name: 'See a list of commands',
                        value: 'help'
                    },
                    {
                        name: 'Guide me',
                        value: 'gui'
                    }
                ],
                name: 'userhelp'
            }
        ]).then(answer => {
            if (answer.userhelp === 'help') {
                const instructions = [
                    '\n',
                    `node liri spotify-this-song <song-name>`,
                    `node liri concert-this <band-name>`,
                    `node liri movie-this <movie-name>`,
                    `node liri do-what-it-says`,
                ].join('\n\n');
                console.log(instructions);
            } else {
                guideMe();
            }
        })
    }
}
try {
    arg ? commands[command](arg) : commands[command]();
}
catch (err) {
    console.log('Unrecognized command');
    commands['noCommand']();
}