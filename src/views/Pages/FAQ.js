import { Accordion, 
    Box, 
    Heading, 
    Flex, 
    useColorMode,
    useColorModeValue, } from "@chakra-ui/react";
import FAQItem from "./ComponentFaq";
import CardBody from "components/Card/CardBody";
import Card from "components/Card/Card";

const FAQ = () => {
    const textColor = useColorModeValue("gray.700", "white");
    const iconColor = useColorModeValue("blue.500", "white");
    const bgProfile = useColorModeValue("hsla(0,0%,100%,.8)", "navy.800");
    const borderProfileColor = useColorModeValue("white", "transparent");
    const emailColor = useColorModeValue("gray.400", "gray.300");
  const faqs = [
    {
      question: "Comment puis-je visualiser les données sur la carte?",
      answer: "Pour visualiser les données, allez sur l'onglet Carte et sélectionnez les couches de données que vous souhaitez afficher."
    },
    {
      question: "Comment exporter des données en CSV?",
      answer: "Accédez à l'onglet Exportation, sélectionnez les données à exporter, puis cliquez sur 'Exporter en CSV'."
    },
    // Ajoute plus de FAQ ici
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
            <Heading as="h1" mb={5}>Foire à Question</Heading>
        </Flex>
        <Card p='16px' my='24px'>
           <CardBody>
                <Box p={5}>
                    <Accordion allowToggle>
                        {faqs.map((faq, index) => (
                        <FAQItem key={index} question={faq.question} answer={faq.answer} />
                        ))}
                    </Accordion>
                </Box>
            </CardBody> 
        </Card>
        
    </Flex>
    
  );
};

export default FAQ;
