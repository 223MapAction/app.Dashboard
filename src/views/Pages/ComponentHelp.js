import { Box, Heading, Text } from "@chakra-ui/react";
import React from "react";

const HelpSection = ({ title, content }) => (
  <Box mb={5}>
    <Heading as="h2" size="md" mb={2}>{title}</Heading>
    <Text>{content}</Text>
  </Box>
);

export default HelpSection;
