import { Box, SimpleGrid, Center, Heading, Flex } from '@chakra-ui/react';
import CityCard from './CityCard';

const Header = () => {
    const cities = [
        { city: "Delhi", lat: 28.6139, lon: 77.2090 },
        { city: "Chennai", lat: 13.0827, lon: 80.2707 },
        { city: "Hyderabad", lat: 17.3850, lon: 78.4867 },
        { city: "Mumbai", lat: 19.0760, lon: 72.8777 },
        { city: "Bangalore", lat: 12.9716, lon: 77.5946 },
        { city: "Kolkata", lat: 22.5726, lon: 88.3639 },
    ];

    return (
        <Center>
            <Flex direction="column" alignItems="center" width="90%" mt="2rem">
                <Heading mb={4}>Weather Monitoring</Heading>
                <Box p={4} width="100%">
                    <SimpleGrid spacing={4} columns={{ base: 1, sm: 2, md: 3 }}>
                        {cities.map((data) => (
                            <CityCard key={data.city} city={data.city} lat={data.lat} lon={data.lon} />
                        ))}
                    </SimpleGrid>
                </Box>
            </Flex>
        </Center>
    );
};

export default Header;
