package com.example.crossword.dto.dtoGame;

import lombok.Data;

@Data
public class GameActionDto {
    private String action;       // "start", "check", "hint", "complete"
    private Long userId;      // для старта игры ✅
    private Long crosswordId; // для старта игры ✅
    private Long wordId;      // для проверки ответа
    private String answer;       // ответ пользователя
    private Integer positionX;   // позиция (если нужно)
    private Integer positionY;
}