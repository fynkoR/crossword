package com.example.crossword.dto.dtoGame;

import lombok.Data;

@Data
public class CheckAnswerResponse {
    private Boolean correct;
    private String correctAnswer;    // Показываем если неправильно
    private String message;
    private Boolean gameComplete;    // Завершена ли вся игра
}
