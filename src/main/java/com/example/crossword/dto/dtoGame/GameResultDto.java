package com.example.crossword.dto.dtoGame;

import lombok.Data;

@Data
public class GameResultDto {
    private Boolean success;     // успех операции
    private String message;      // сообщение для пользователя
    private String data;         // дополнительная data (подсказка, правильный ответ)
    private Boolean gameComplete; // завершена ли игра
    private GameDto game;        // обновленное состояние игры
}
