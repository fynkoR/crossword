package com.example.crossword.dto.dtoGame;

import org.springframework.stereotype.Component;

@Component
public class ResponseHelper {

    public static CheckAnswerResponse createErrorResponse(String message) {
        CheckAnswerResponse response = new CheckAnswerResponse();
        response.setCorrect(false);
        response.setMessage(message);
        response.setGameComplete(false);
        return response;
    }

    public static CheckAnswerResponse createErrorResponse(String message, String correctAnswer) {
        CheckAnswerResponse response = new CheckAnswerResponse();
        response.setCorrect(false);
        response.setMessage(message);
        response.setCorrectAnswer(correctAnswer);
        response.setGameComplete(false);
        return response;
    }

    public static CheckAnswerResponse createSuccessResponse(String message, Boolean gameComplete) {
        CheckAnswerResponse response = new CheckAnswerResponse();
        response.setCorrect(true);
        response.setMessage(message);
        response.setGameComplete(gameComplete);
        return response;
    }

    public static CheckAnswerResponse createSuccessResponse(String message, Boolean gameComplete, Integer solvedWords, Integer totalWords) {
        CheckAnswerResponse response = new CheckAnswerResponse();
        response.setCorrect(true);
        response.setMessage(String.format("%s Отгадано: %d/%d ", message, solvedWords, totalWords));
        response.setGameComplete(gameComplete);
        return response;
    }
}