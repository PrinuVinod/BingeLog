import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, CircularProgress, Box, Button } from '@mui/material';

const Dashboard = () => {
    const [animes, setAnimes] = useState([]);
    const [series, setSeries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selected, setSelected] = useState('Anime');

    const apiKey = 'AIzaSyCbCOCi1VPJzdcjQt8X4L7OCT1Yb9a70cY';
    const sheetId = '1GtvTJPq2tqIWIreGil5skxhW5xxEjrctMzgHoPiNbiI';
    const range = 'Sheet1';

    useEffect(() => {
        const fetchShows = async () => {
            try {
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

                    setAnimes(animeData);
                    setSeries(seriesData);
                }
            } catch (error) {
                setError('Error fetching data from Google Sheets');
                console.error('Error fetching data from Google Sheets:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchShows();
    }, []);

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
                                        <TableCell><strong>Anime Name</strong></TableCell>
                                        <TableCell><strong>Episodes Watched</strong></TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {animes.map((anime, index) => (
                                        <TableRow key={index}>
                                            <TableCell>{anime['Anime Name']}</TableCell>
                                            <TableCell sx={{ whiteSpace: 'normal', wordWrap: 'break-word' }}>
                                                {anime['Episodes Watched']}
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
            ) : (
                <>
                    <Typography variant="h5" gutterBottom>
                        TV Shows Watched
                    </Typography>
                    {series.length > 0 ? (
                        <TableContainer component={Paper} sx={{ width: '100%' }}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell><strong>Series Name</strong></TableCell>
                                        <TableCell><strong>Episodes Watched</strong></TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {series.map((show, index) => (
                                        <TableRow key={index}>
                                            <TableCell>{show['Series Name']}</TableCell>
                                            <TableCell sx={{ whiteSpace: 'normal', wordWrap: 'break-word' }}>
                                                {show['Episodes Watched']}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    ) : (
                        <Typography>No TV shows data available.</Typography>
                    )}
                </>
            )}
        </Container>
    );
};

export default Dashboard;
