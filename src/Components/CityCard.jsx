import React, { useEffect, useState } from 'react';
import {
  Box, Table, Tbody, Tr, Td, Text, Spinner, Button, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, useDisclosure, Divider, Input, FormControl, FormLabel
} from '@chakra-ui/react';
import axios from 'axios';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
const WEATHER_API_KEY = '48059554a0d28c79032a0b6e2499b868'
const SUMMARY_API_URL = 'https://rengine-umber.vercel.app/api/v1/weather/summaries';

const CityCard = ({ city, lat, lon }) => {
  const [loading, setLoading] = useState(true);
  const [weatherData, setWeatherData] = useState(null);
  const [summaryData, setSummaryData] = useState(null);
  const [historicalData, setHistoricalData] = useState([]);
  const [alertTemp, setAlertTemp] = useState('');
  const [alertDays, setAlertDays] = useState('');
  const [alertSet, setAlertSet] = useState(false);
  const [showAlertInputs, setShowAlertInputs] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    const fetchWeatherData = async () => {
      try {
        const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${WEATHER_API_KEY}`);
        setWeatherData(response.data);
      } catch (error) {
        console.error('Error fetching weather data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWeatherData();
  }, [lat, lon]);

  useEffect(() => {
    // Check localStorage for alerts
    const alertSettings = JSON.parse(localStorage.getItem('weatherAlerts')) || {};
    if (alertSettings[city]) {
      const { temp, days } = alertSettings[city];
      setAlertTemp(temp);
      setAlertDays(days);
      setAlertSet(true);
    }
  }, [city]);

  const fetchSummaryData = async () => {
    try {
      const response = await axios.get(SUMMARY_API_URL);
      const data = response.data;
      const newdata=data.reverse();
      const citySummary = newdata.find((item) => item._id.city === city);
      setSummaryData(citySummary);
    } catch (error) {
      console.error('Error fetching summary data:', error);
    }
  };

  const fetchHistoricalData = async () => {
    try {
      const response = await axios.get(SUMMARY_API_URL);
      const data = response.data;
      const historical = data.filter((item) => item._id.city === city);
      setHistoricalData(historical);
    } catch (error) {
      console.error('Error fetching historical data:', error);
    }
  };

  const handleOpen = async () => {
    await fetchSummaryData();
    await fetchHistoricalData(); // Fetch historical data when the button is clicked
    onOpen();
  };

  const handleSetAlert = async () => {
    await fetchHistoricalData(); // Fetch historical data when the button is clicked
    const alerts = JSON.parse(localStorage.getItem('weatherAlerts')) || {};
    alerts[city] = {
      temp: parseFloat(alertTemp),
      days: parseInt(alertDays, 10),
    };
    localStorage.setItem('weatherAlerts', JSON.stringify(alerts));
    setAlertSet(true);
    setShowAlertInputs(false); // Hide the inputs after setting the alert
  };

  const isAlertTriggered = () => {
    if (summaryData && alertSet) {
      const today = new Date().toISOString().split('T')[0];
      const recentSummaries = historicalData.slice(-alertDays);
      const exceededDays = recentSummaries.filter(
        (summary) => summary._id.date === today && summary.avgTemp < alertTemp
      ).length;
      return exceededDays >= alertDays;
    }
    return false;
  };

  if (loading) {
    return <Spinner />;
  }

  if (!weatherData) {
    return <div>Error loading weather data</div>;
  }

  const { main, weather, dt } = weatherData;
  const { temp, feels_like } = main;
  const weatherMain = weather[0].main;
  const updateTime = new Date(dt * 1000).toLocaleString();

  return (
    <Box p={4} borderWidth={1} borderRadius={8} boxShadow="lg" bg={isAlertTriggered() ? 'lightcoral' : 'white'}>
      <Table variant="simple">
        <Tbody>
          <Tr>
            <Td><Text fontWeight="bold">City</Text></Td>
            <Td><Text fontWeight="bold">{city}</Text></Td>
          </Tr>
          <Tr>
            <Td><Text fontWeight="bold">Main</Text></Td>
            <Td>{weatherMain}</Td>
          </Tr>
          <Tr>
            <Td><Text fontWeight="bold">Temperature (°C)</Text></Td>
            <Td>{temp}</Td>
          </Tr>
          <Tr>
            <Td><Text fontWeight="bold">Feels Like (°C)</Text></Td>
            <Td>{feels_like}</Td>
          </Tr>
          <Tr>
            <Td><Text fontWeight="bold">Last Updated</Text></Td>
            <Td>{updateTime}</Td>
          </Tr>
        </Tbody>
      </Table>
      <Button mt={4} onClick={handleOpen} size="sm" ml={2}>View Summary</Button>

      <Button mt={4} onClick={() => setShowAlertInputs(!showAlertInputs)} size="sm" ml={2}>
        {showAlertInputs ? 'Cancel Alert' : 'Create Alert'}
      </Button>

      {showAlertInputs && (
        <FormControl mt={4}>
          <FormLabel htmlFor="alertTemp">Alert Temperature (°C)</FormLabel>
          <Input
            id="alertTemp"
            type="number"
            value={alertTemp}
            onChange={(e) => setAlertTemp(e.target.value)}
          />
          <FormLabel mt={2} htmlFor="alertDays">Consecutive Days</FormLabel>
          <Input
            id="alertDays"
            type="number"
            value={alertDays}
            onChange={(e) => setAlertDays(e.target.value)}
          />
          <Button mt={4} colorScheme="teal" onClick={handleSetAlert}>Set Alert</Button>
        </FormControl>
      )}

      <Modal onClose={onClose} size="full" isOpen={isOpen}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{city} Weather Summary</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {summaryData ? (
              <>
                <Table variant="simple" mb={4}>
                  <Tbody>
                    <Tr>
                      <Td><Text fontWeight="bold">City</Text></Td>
                      <Td>{summaryData._id.city}</Td>
                    </Tr>
                    <Tr>
                      <Td><Text fontWeight="bold">Date</Text></Td>
                      <Td>{summaryData._id.date}</Td>
                    </Tr>
                    <Tr>
                      <Td><Text fontWeight="bold">Average Temperature (°C)</Text></Td>
                      <Td>{summaryData.avgTemp}</Td>
                    </Tr>
                    <Tr>
                      <Td><Text fontWeight="bold">Max Temperature (°C)</Text></Td>
                      <Td>{summaryData.maxTemp}</Td>
                    </Tr>
                    <Tr>
                      <Td><Text fontWeight="bold">Min Temperature (°C)</Text></Td>
                      <Td>{summaryData.minTemp}</Td>
                    </Tr>
                    <Tr>
                      <Td><Text fontWeight="bold">Dominant Condition</Text></Td>
                      <Td>{summaryData.dominantCondition}</Td>
                    </Tr>
                  </Tbody>
                </Table>
                <Divider mb={4} />
                <Text fontWeight="bold" mb={2}>Historical Data</Text>
                {historicalData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={historicalData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="_id.date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="avgTemp" stroke="#8884d8" />
                      <Line type="monotone" dataKey="maxTemp" stroke="#82ca9d" />
                      <Line type="monotone" dataKey="minTemp" stroke="#ff7300" />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <Text>No historical data available</Text>
                )}
              </>
            ) : (
              <Spinner />
            )}
          </ModalBody>
          <ModalFooter>
            <Button onClick={onClose}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default CityCard;
