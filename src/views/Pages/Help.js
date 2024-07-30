import { Accordion, 
    Box, 
    Heading, 
    Flex, 
    useColorMode,
    useColorModeValue, } from "@chakra-ui/react";
import FAQItem from "./ComponentFaq";
import CardBody from "components/Card/CardBody";
import Card from "components/Card/Card";
import HelpSection from "./ComponentHelp";

export default function Help(){
    const bgProfile = useColorModeValue("hsla(0,0%,100%,.8)", "navy.800");
    const borderProfileColor = useColorModeValue("white", "transparent");
    const helpTopics = [
        {
          title: "Guide d'utilisation du tableau de bord",
          content: "Ce guide vous explique comment naviguer et utiliser les différentes fonctionnalités du tableau de bord."
        },
        {
          title: "Dépannage",
          content: "En cas de problèmes, consultez cette section pour des conseils de dépannage courants."
        },
        // Ajoute plus de sections d'aide ici
    ];
    return (
        <Flex direction='column' pt={{ base: "120px", md: "75px", lg: "100px" }}>
          <Flex
            direction={{ sm: "column", md: "row" }}
            mb='24px'
            maxH='330px'
            justifyContent={{ sm: "center", md: "space-between" }}
            align='center'
            backdropFilter='blur(21px)'
            boxShadow='0px 2px 5.5px rgba(0, 0, 0, 0.02)'
            border='1.5px solid'
            borderColor={borderProfileColor}
            bg={bgProfile}
            p='24px'
            borderRadius='20px'>
                <Heading as="h1" mb={5}>Aide en ligne</Heading>
            </Flex>
            <Card p='16px' my='24px'>
               <CardBody>
                    <Box p={5}>
                        <Accordion allowToggle>
                            {helpTopics.map((topic, index) => (
                                <HelpSection key={index} title={topic.title} content={topic.content} />
                            ))}
                        </Accordion>
                    </Box>
                </CardBody> 
            </Card>
        </Flex>
    );
};
    
    
