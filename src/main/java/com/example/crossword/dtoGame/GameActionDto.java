package com.example.crossword.dtoGame;

import lombok.Data;

@Data
public class GameActionDto {
    private String action;       // "start", "check", "hint", "complete"
    private Integer userId;      // для старта игры ✅
    private Integer crosswordId; // для старта игры ✅
    private Integer wordId;      // для проверки ответа
    private String answer;       // ответ пользователя
    private Integer positionX;   // позиция (если нужно)
    private Integer positionY;
}