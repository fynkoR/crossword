package com.example.crossword.dtoGame;

import lombok.Data;

@Data
public class CheckAnswerResponse {
    private boolean correct;
    private String correctAnswer;    // Показываем если неправильно
    private String message;
    private boolean gameComplete;    // Завершена ли вся игра
}
