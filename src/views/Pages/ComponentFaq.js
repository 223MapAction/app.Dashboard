import { Box, Text, Accordion, AccordionItem, AccordionButton, AccordionPanel, AccordionIcon, useColorModeValue } from "@chakra-ui/react";
import React from "react";

const FAQItem = ({ question, answer }) => (

  <AccordionItem>
    <h2>
      <AccordionButton>
        <Box flex="1" textAlign="left">
          {question}
        </Box>
        <AccordionIcon />
      </AccordionButton>
    </h2>
    <AccordionPanel pb={4}>
      {answer}
    </AccordionPanel>
  </AccordionItem>
);

export default FAQItem;
