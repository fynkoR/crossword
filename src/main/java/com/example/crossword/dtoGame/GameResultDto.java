package com.example.crossword.dtoGame;

import lombok.Data;

@Data
public class GameResultDto {
    private boolean success;     // успех операции
    private String message;      // сообщение для пользователя
    private String data;         // дополнительная data (подсказка, правильный ответ)
    private boolean gameComplete; // завершена ли игра
    private GameDto game;        // обновленное состояние игры
}
