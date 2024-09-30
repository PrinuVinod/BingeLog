import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
    Container, Typography, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Paper, CircularProgress, Box, Button
} from '@mui/material';
import { apiKey, sheetId, range } from './config'; // Adjust the path as needed

const Dashboard = () => {
    const [animes, setAnimes] = useState([]);
    const [series, setSeries] = useState([]);
    const [animeDbData, setAnimeDbData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selected, setSelected] = useState('Anime');

    useEffect(() => {
        const fetchShows = async () => {
            try {
                setLoading(true);
                const response = await axios.get(
                    `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}?key=${apiKey}`
                );

                const rows = response.data.values;
                if (rows && rows.length > 0) {
                    const headers = rows[0];
                    const data = rows.slice(1).map((row) =>
                        headers.reduce((acc, header, index) => {
                            acc[header] = row[index] || ''; // Set default empty string if a value is undefined
                            return acc;
                        }, {})
                    );

                    // Split data into anime and series
                    const animeData = data.filter((item) => item['Anime Name']);
                    const seriesData = data.filter((item) => item['Series Name']);

                    // Fetch data from anime-db API for each anime
                    const animeDataWithGenres = await Promise.all(
                        animeData.map(async (anime) => {
                            try {
                                const animeName = encodeURIComponent(anime['Anime Name']);
                                const apiResponse = await axios.get(
                                    `https://anime-db.p.rapidapi.com/anime?page=1&size=1&search=${animeName}`,
                                    {
                                        headers: {
                                            'x-rapidapi-host': 'anime-db.p.rapidapi.com',
                                            'x-rapidapi-key': '2a5855ac7bmsh19fc68957f35ea7p116f24jsn801f0e6a41a5',
                                        },
                                    }
                                );

                                const genres = apiResponse.data.data?.[0]?.genres || [];
                                return { ...anime, genres };
                            } catch (err) {
                                console.error(`Error fetching genres for anime: ${anime['Anime Name']}`, err.message);
                                return { ...anime, genres: [] };
                            }
                        })
                    );

                    setAnimes(animeDataWithGenres);
                    setSeries(seriesData);
                } else {
                    console.log('No rows found');
                }
            } catch (error) {
                setError('Error fetching data from Google Sheets');
                console.error('Error fetching data from Google Sheets:', error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchShows();
    }, []);

    const fetchAnimeDbData = async () => {
        try {
            setLoading(true);
            const response = await axios.get(
                'https://anime-db.p.rapidapi.com/anime?page=1&size=10&sortBy=ranking&sortOrder=asc',
                {
                    headers: {
                        'x-rapidapi-host': 'anime-db.p.rapidapi.com',
                        'x-rapidapi-key': '2a5855ac7bmsh19fc68957f35ea7p116f24jsn801f0e6a41a5',
                    },
                }
            );

            setAnimeDbData(response.data.data);
        } catch (error) {
            setError('Error fetching data from AnimeDB API');
            console.error('Error fetching data from AnimeDB API:', error.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Container>
                <Typography variant="h4" gutterBottom>
                    BingeLog Dashboard
                </Typography>
                <Typography color="error">{error}</Typography>
            </Container>
        );
    }

    return (
        <Container maxWidth={false}>
            <Typography variant="h4" gutterBottom>
                BingeLog Dashboard
            </Typography>

            {/* Toggle Button Section */}
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
                <Box
                    sx={{
                        display: 'flex',
                        borderRadius: '30px',
                        overflow: 'hidden',
                        boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.1)',
                    }}
                >
                    <Button
                        onClick={() => setSelected('Anime')}
                        sx={{
                            backgroundColor: selected === 'Anime' ? '#4caf50' : '#e0f2f1',
                            color: selected === 'Anime' ? '#fff' : '#000',
                            padding: '10px 20px',
                            fontWeight: 'bold',
                            borderRadius: '0px',
                            '&:hover': {
                                backgroundColor: selected === 'Anime' ? '#388e3c' : '#c8e6c9',
                            },
                        }}
                    >
                        Anime
                    </Button>
                    <Button
                        onClick={() => setSelected('TV Shows')}
                        sx={{
                            backgroundColor: selected === 'TV Shows' ? '#4caf50' : '#e0f2f1',
                            color: selected === 'TV Shows' ? '#fff' : '#000',
                            padding: '10px 20px',
                            fontWeight: 'bold',
                            borderRadius: '0px',
                            '&:hover': {
                                backgroundColor: selected === 'TV Shows' ? '#388e3c' : '#c8e6c9',
                            },
                        }}
                    >
                        TV Shows
                    </Button>
                    <Button
                        onClick={() => {
                            setSelected('AnimeDB');
                            fetchAnimeDbData();
                        }}
                        sx={{
                            backgroundColor: selected === 'AnimeDB' ? '#4caf50' : '#e0f2f1',
                            color: selected === 'AnimeDB' ? '#fff' : '#000',
                            padding: '10px 20px',
                            fontWeight: 'bold',
                            borderRadius: '0px',
                            '&:hover': {
                                backgroundColor: selected === 'AnimeDB' ? '#388e3c' : '#c8e6c9',
                            },
                        }}
                    >
                        AnimeDB API Data
                    </Button>
                </Box>
            </Box>

            {/* Content Section */}
            {selected === 'Anime' ? (
                <>
                    <Typography variant="h5" gutterBottom>
                        Anime Watched
                    </Typography>
                    {animes.length > 0 ? (
                        <TableContainer component={Paper} sx={{ marginBottom: '20px', width: '100%' }}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{ width: '30%' }}><strong>Anime Name</strong></TableCell>
                                        <TableCell sx={{ width: '30%' }}><strong>Episodes Watched</strong></TableCell>
                                        <TableCell sx={{ width: '40%' }}><strong>Genres</strong></TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {animes.map((anime, index) => (
                                        <TableRow key={index}>
                                            <TableCell>{anime['Anime Name']}</TableCell>
                                            <TableCell>{anime['Episodes Watched']}</TableCell>
                                            <TableCell>
                                                {anime.genres.length > 0
                                                    ? anime.genres.join(', ')
                                                    : 'No genres found'}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    ) : (
                        <Typography>No anime data available.</Typography>
                    )}
                </>
            ) : selected === 'TV Shows' ? (
                <>
                    <Typography variant="h5" gutterBottom>
                        TV Shows Watched
                    </Typography>
                    {series.length > 0 ? (
                        <TableContainer component={Paper} sx={{ width: '100%' }}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{ width: '50%' }}><strong>Series Name</strong></TableCell>
                                        <TableCell sx={{ width: '50%' }}><strong>Episodes Watched</strong></TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {series.map((show, index) => (
                                        <TableRow key={index}>
                                            <TableCell>{show['Series Name']}</TableCell>
                                            <TableCell>{show['Episodes Watched']}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    ) : (
                        <Typography>No series data available.</Typography>
                    )}
                </>
            ) : (
                <>
                    <Typography variant="h5" gutterBottom>
                        AnimeDB API Data
                    </Typography>
                    {animeDbData.length > 0 ? (
                        <TableContainer component={Paper} sx={{ width: '100%' }}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell><strong>Title</strong></TableCell>
                                        <TableCell><strong>Ranking</strong></TableCell>
                                        <TableCell><strong>Genres</strong></TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {animeDbData.map((anime, index) => (
                                        <TableRow key={index}>
                                            <TableCell>{anime.title}</TableCell>
                                            <TableCell>{anime.ranking}</TableCell>
                                            <TableCell>{anime.genres.join(', ')}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    ) : (
                        <Typography>No AnimeDB API data available.</Typography>
                    )}
                </>
            )}
        </Container>
    );
};

export default Dashboard;
