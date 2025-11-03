package com.example.crossword.dtoGame;

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

    public static CheckAnswerResponse createSuccessResponse(String message, boolean gameComplete) {
        CheckAnswerResponse response = new CheckAnswerResponse();
        response.setCorrect(true);
        response.setMessage(message);
        response.setGameComplete(gameComplete);
        return response;
    }

    public static CheckAnswerResponse createSuccessResponse(String message, boolean gameComplete, int solvedWords, int totalWords) {
        CheckAnswerResponse response = new CheckAnswerResponse();
        response.setCorrect(true);
        response.setMessage(message + " Отгадано: " + solvedWords + "/" + totalWords);
        response.setGameComplete(gameComplete);
        return response;
    }
}