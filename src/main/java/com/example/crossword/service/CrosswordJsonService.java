package com.example.crossword.service;

import com.example.crossword.dtoCrossword.CrosswordGrid;
import com.example.crossword.dtoCrossword.CrosswordWords;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.stereotype.Service;

@Service
public class CrosswordJsonService {
    private final ObjectMapper objectMapper;

    public CrosswordJsonService() {
        this.objectMapper = new ObjectMapper();
        this.objectMapper.registerModule(new JavaTimeModule());
        this.objectMapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
    }

    public CrosswordGrid parseGridData(String gridJson) {
        try {
            return objectMapper.readValue(gridJson, CrosswordGrid.class);
        } catch (Exception e) {
            throw new RuntimeException("Error parsing grid JSON", e);
        }
    }

    public String serializeGridData(CrosswordGrid grid) {
        try {
            return objectMapper.writeValueAsString(grid);
        } catch (Exception e) {
            throw new RuntimeException("Error serializing grid to JSON", e);
        }
    }

    public CrosswordWords parseWordsData(String wordsJson) {
        try {
            return objectMapper.readValue(wordsJson, CrosswordWords.class);
        } catch (Exception e) {
            throw new RuntimeException("Error parsing words JSON", e);
        }
    }

    public String serializeWordsData(CrosswordWords words) {
        try {
            return objectMapper.writeValueAsString(words);
        } catch (Exception e) {
            throw new RuntimeException("Error serializing words to JSON", e);
        }
    }
}
